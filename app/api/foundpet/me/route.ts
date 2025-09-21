import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check session
    const session = await getServerSession(options);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // Step 1: Update expired posts (older than 14 days)
    const now = new Date();
    const expirationThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    await prisma.foundPet.updateMany({
      where: {
        userId: session.user.id,
        createdAt: { lt: expirationThreshold },
        status: { notIn: ['expired', 'closed', 'fake'] },
      },
      data: {
        status: 'expired',
        updatedAt: new Date(),
      },
    });

    // Step 2: Fetch paginated data
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const species = searchParams.get('species') || undefined;
    const status = searchParams.get('status') || undefined;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId: session.user.id, // Only FoundPet records of the logged-in user
    };

    // Add conditions for species and status
    if (species) {
      whereClause.species = { name: species };
    }
    if (status) {
      whereClause.status = status;
    }

    // Fetch FoundPet records and count total
    const [foundPets, total] = await Promise.all([
      prisma.foundPet.findMany({
        where: whereClause,
        include: {
          species: {
            select: { id: true, name: true },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              province: true,
            },
          },
          images: {
            select: { url: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.foundPet.count({ where: whereClause }),
    ]);

    // Map data to safe format
    const safeFoundPets = foundPets.map(foundPet => ({
      id: foundPet.id,
      description: foundPet.description,
      location: foundPet.location,
      lat: foundPet.lat,
      lng: foundPet.lng,
      foundDate: foundPet.foundDate,
      breed: foundPet.breed,
      gender: foundPet.gender,
      color: foundPet.color,
      age: foundPet.age,
      distinctive: foundPet.distinctive,
      status: foundPet.status,
      species: foundPet.species,
      user: foundPet.user,
      images: foundPet.images,
      createdAt: foundPet.createdAt,
      updatedAt: foundPet.updatedAt,
    }));

    return NextResponse.json({
      data: safeFoundPets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user's found pets:", error);
    return NextResponse.json(
      { 
        message: 'ไม่สามารถดึงข้อมูลได้',
        error: process.env.NODE_ENV === 'development' ? error : undefined 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
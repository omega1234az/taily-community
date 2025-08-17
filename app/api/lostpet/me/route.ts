import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - ปลอดภัยแล้ว ไม่เปิดเผยข้อมูลส่วนตัว
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const species = searchParams.get('species');
    const province = searchParams.get('province');
    const status = searchParams.get('status') || 'lost';
    const userId = session.user.id;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      status: 'lost',
      userId: userId // เพิ่มเงื่อนไขเพื่อกรองตาม userId
    };

    if (species) {
      whereClause.pet = {
        species: {
          name: species
        }
      };
    }

    if (province) {
      whereClause.user = {
        province: province
      };
    }

    const [lostPets, total] = await Promise.all([
      prisma.lostPet.findMany({
        where: whereClause,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: { select: { name: true } },
              breed: true,
              gender: true,
              age: true,
              color: true,
              description: true,
              markings: true,
              images: { select: { url: true } }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              province: true
            }
          },
          images: {
            select: { url: true }
          },
          clues: {
            select: {
              id: true,
              content: true,
              location: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true
                }
              },
              images: {
                select: { url: true }
              }
            }
          },
        },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lostPet.count({ where: whereClause })
    ]);

    // เพิ่มความปลอดภัยโดยการซ่อนข้อมูลเพิ่มเติม
    const safeLostPets = lostPets.map(lostPet => ({
      id: lostPet.id,
      description: lostPet.description,
      location: lostPet.location,
      lostDate: lostPet.lostDate,
      reward: lostPet.reward,
      status: lostPet.status,
      ownerName: lostPet.ownerName,
      pet: lostPet.pet,
      user: lostPet.user,
      images: lostPet.images,
      clues: lostPet.clues,
      createdAt: lostPet.createdAt,
    }));

    return NextResponse.json({
      data: safeLostPets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching lost pets:", error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}
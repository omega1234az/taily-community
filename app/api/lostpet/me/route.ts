import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
  status: { in: ['lost', 'expired'] }, // รวมทั้ง lost และ expired
  userId: userId
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

    // ✅ อัพเดตโพสต์ที่เกิน 14 วันเป็น expired
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 14);

    await prisma.lostPet.updateMany({
      where: {
        status: 'lost',
        createdAt: { lt: expiredDate }
      },
      data: { status: 'expired' }
    });

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
              images: { select: { url: true, mainImage: true } }
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

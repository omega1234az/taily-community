import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // หา userId จาก email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้งานในระบบ" }, { status: 404 });
    }

    const body = await req.json();
    const {
      description,
      location,
      lat,
      lng,
      lostDate,
      reward,
      status,
      petId,
      ownerName,
      phone,
      facebook,
    } = body;

    // Validate input data
    if (!description || !location || !lostDate || !petId) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Validate coordinate values
    if (lat && (lat < -90 || lat > 90)) {
      return NextResponse.json({ message: "ค่าละติจูดไม่ถูกต้อง" }, { status: 400 });
    }
    if (lng && (lng < -180 || lng > 180)) {
      return NextResponse.json({ message: "ค่าลองจิจูดไม่ถูกต้อง" }, { status: 400 });
    }

    // Validate phone number format (if provided)
    if (phone && !/^[0-9]{9,10}$/.test(phone.replace(/[-\s]/g, ''))) {
      return NextResponse.json({ message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" }, { status: 400 });
    }

    // เช็คว่า petId นี้เป็นของ user นี้หรือไม่
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });
    if (!pet) {
      return NextResponse.json({ message: "ไม่พบสัตว์เลี้ยงนี้" }, { status: 404 });
    }
    if (pet.userId !== user.id) {
      return NextResponse.json({ message: "สัตว์เลี้ยงนี้ไม่ใช่ของคุณ" }, { status: 403 });
    }

    // เช็คว่า petId นี้ถูกประกาศหายแล้วหรือยัง (เพราะ petId ต้อง unique)
    const exists = await prisma.lostPet.findFirst({
      where: { 
        petId: petId,
        status: { not: 'reunited' } // ยกเว้นกรณีที่เจอแล้ว
      },
    });

    if (exists) {
      return NextResponse.json({ message: "สัตว์เลี้ยงตัวนี้ถูกประกาศหายไปแล้ว" }, { status: 400 });
    }

    // สร้าง LostPet
    const lostPet = await prisma.lostPet.create({
      data: {
        description,
        location,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        lostDate: new Date(lostDate),
        reward: reward ? parseFloat(reward) : null,
        status: status || 'lost',
        userId: user.id,
        petId: petId,
        ownerName,
        phone,
        facebook,
      },
    });

    // Return created data without sensitive information
    const safeResponse = {
      id: lostPet.id,
      description: lostPet.description,
      location: lostPet.location,
      lostDate: lostPet.lostDate,
      reward: lostPet.reward,
      status: lostPet.status,
      petId: lostPet.petId,
      createdAt: lostPet.createdAt,
    };

    return NextResponse.json(safeResponse, { status: 201 });

  } catch (error) {
    console.error("Error creating lost pet:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการประกาศสัตว์หาย" }, { status: 500 });
  }
}

// GET - ปลอดภัยแล้ว ไม่เปิดเผยข้อมูลส่วนตัว
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const species = searchParams.get('species');
    const province = searchParams.get('province');
    const status = searchParams.get('status') || 'lost';

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      status: status
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
              // ไม่เอา email, phone, address เพื่อความปลอดภัย
              province: true // เอาแค่จังหวัดเพื่อแสดงพื้นที่โดยทั่วไป
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
              // ไม่เอา lat, lng เพื่อความปลอดภัย
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
      // ไม่ส่ง lat, lng เพื่อความปลอดภัย - จะส่งเมื่อมีการติดต่อ
      lostDate: lostPet.lostDate,
      reward: lostPet.reward,
      status: lostPet.status,
      // ไม่ส่งข้อมูล phone, facebook - จะแสดงเมื่อมีการติดต่อ
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
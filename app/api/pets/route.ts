import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        images: true,
        chronicDiseases: true,
        vaccines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pets);
  } catch (error) {
    console.error('[GET_PETS_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: เพิ่มสัตว์เลี้ยงใหม่
export async function POST(request: Request) {
  try {
    // ตรวจสอบ session ด้วย NextAuth
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนเพิ่มสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก request body
    const body = await request.json();
    const { name, species, breed, gender, age, color, description, markings, isNeutered } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !species) {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อและประเภทของสัตว์เลี้ยง' },
        { status: 400 }
      );
    }

    // สร้างสัตว์เลี้ยงใหม่
    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        gender,
        age,
        color,
        description,
        markings,
        isNeutered: isNeutered ? 1 : 0, // แปลง boolean เป็น Int (0 หรือ 1)
        user: {
          connect: { id: session.user.id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        images: true,
        chronicDiseases: true,
        vaccines: true,
      },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error('[POST_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
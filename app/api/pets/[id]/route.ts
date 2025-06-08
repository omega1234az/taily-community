import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลสัตว์เลี้ยงโดย ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // รอ params และแปลง id เป็น Int
    const { id } = await params;
    const petId = parseInt(id);

    // ตรวจสอบว่า petId เป็นตัวเลขที่ถูกต้อง
    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findUnique({
      where: {
        id: petId,
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

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('[GET_PET_BY_ID_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: อัปเดตข้อมูลสัตว์เลี้ยง
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session ด้วย NextAuth
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนแก้ไขข้อมูลสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // รอ params และแปลง id เป็น Int
    const { id } = await params;
    const petId = parseInt(id);

    // ตรวจสอบว่า petId เป็นตัวเลขที่ถูกต้อง
    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า pet มีอยู่และ user เป็นเจ้าของ
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true },
    });

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์แก้ไขสัตว์เลี้ยงนี้' },
        { status: 403 }
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

    // อัปเดตข้อมูลสัตว์เลี้ยง
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name,
        species,
        breed,
        gender,
        age,
        color,
        description,
        markings,
        isNeutered: isNeutered ? 1 : 0,
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

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error('[PUT_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบสัตว์เลี้ยง
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session ด้วย NextAuth
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนลบสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // รอ params และแปลง id เป็น Int
    const { id } = await params;
    const petId = parseInt(id);

    // ตรวจสอบว่า petId เป็นตัวเลขที่ถูกต้อง
    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า pet มีอยู่และ user เป็นเจ้าของ
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true },
    });

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์ลบสัตว์เลี้ยงนี้' },
        { status: 403 }
      );
    }

    // ลบสัตว์เลี้ยง
    await prisma.pet.delete({
      where: { id: petId },
    });

    return NextResponse.json(
      { message: 'ลบสัตว์เลี้ยงสำเร็จ' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
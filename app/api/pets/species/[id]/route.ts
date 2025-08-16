import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { options } from '../../../auth/[...nextauth]/option'; // สมมติว่า authOptions อยู่ใน lib/auth

const prisma = new PrismaClient();

// PUT: อัพเดทข้อมูล PetSpecies ตาม ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session และ role
    const session = await getServerSession(options);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถอัพเดทข้อมูลได้' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const speciesId = parseInt(id);
    const { name } = await request.json();

    if (isNaN(speciesId)) {
      return NextResponse.json(
        { message: 'ID ประเภทสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อประเภทสัตว์เลี้ยงที่ถูกต้อง' },
        { status: 400 }
      );
    }

    const updatedPetSpecies = await prisma.petSpecies.update({
      where: { id: speciesId },
      data: {
        name,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedPetSpecies);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'ไม่พบประเภทสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }
    console.error('[PUT_PET_SPECIES_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลประเภทสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบ PetSpecies ตาม ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session และ role
    const session = await getServerSession(options);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบข้อมูลได้' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json(
        { message: 'ID ประเภทสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    await prisma.petSpecies.delete({
      where: { id: speciesId },
    });

    return NextResponse.json(
      { message: 'ลบประเภทสัตว์เลี้ยงสำเร็จ' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'ไม่พบประเภทสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }
    console.error('[DELETE_PET_SPECIES_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบประเภทสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
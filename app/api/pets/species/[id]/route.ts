import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล PetSpecies ตาม ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json(
        { message: 'ID ประเภทสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const petSpecies = await prisma.petSpecies.findUnique({
      where: { id: speciesId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!petSpecies) {
      return NextResponse.json(
        { message: 'ไม่พบประเภทสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    return NextResponse.json(petSpecies);
  } catch (error) {
    console.error('[GET_PET_SPECIES_BY_ID_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
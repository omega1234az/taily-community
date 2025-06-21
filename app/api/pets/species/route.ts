import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล PetSpecies ทั้งหมด
export async function GET() {
  try {
    const petSpecies = await prisma.petSpecies.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(petSpecies);
  } catch (error) {
    console.error('[GET_PET_SPECIES_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล PetChronicDisease ทั้งหมด (กรองตาม petId ได้)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    const where = petId ? { petId: parseInt(petId) } : {};

    if (petId && isNaN(parseInt(petId))) {
      return NextResponse.json(
        { message: 'petId ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const chronicDiseases = await prisma.petChronicDisease.findMany({
      where,
      select: {
        id: true,
        petId: true,
        disease: true,
        description: true,
        diagnosedAt: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        diagnosedAt: 'desc',
      },
    });

    return NextResponse.json(chronicDiseases);
  } catch (error) {
    console.error('[GET_CHRONIC_DISEASES_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรคประจำตัว' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: เพิ่ม PetChronicDisease ใหม่
export async function POST(request: Request) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนเพิ่มโรคประจำตัว' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก JSON body
    const { petId, disease, description, diagnosedAt } = await request.json();

    // ตรวจสอบข้อมูล
    if (!petId || !disease) {
      return NextResponse.json(
        { message: 'กรุณาระบุ petId และชื่อโรค' },
        { status: 400 }
      );
    }
    if (isNaN(parseInt(petId))) {
      return NextResponse.json(
        { message: 'petId ไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    if (diagnosedAt && isNaN(Date.parse(diagnosedAt))) {
      return NextResponse.json(
        { message: 'วันที่วินิจฉัยไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า petId มีอยู่
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(petId) },
    });
    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    // สร้าง PetChronicDisease
    const chronicDisease = await prisma.petChronicDisease.create({
      data: {
        petId: parseInt(petId),
        disease,
        description: description || null,
        diagnosedAt: diagnosedAt ? new Date(diagnosedAt) : null,
      },
      select: {
        id: true,
        petId: true,
        disease: true,
        description: true,
        diagnosedAt: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(chronicDisease, { status: 201 });
  } catch (error) {
    console.error('[POST_CHRONIC_DISEASE_ERROR]', error);
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการเพิ่มโรคประจำตัว', 
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
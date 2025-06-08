import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล PetChronicDisease ตาม ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const diseaseId = parseInt(id);

    if (isNaN(diseaseId)) {
      return NextResponse.json(
        { message: 'ID โรคประจำตัวไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const chronicDisease = await prisma.petChronicDisease.findUnique({
      where: { id: diseaseId },
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

    if (!chronicDisease) {
      return NextResponse.json(
        { message: 'ไม่พบโรคประจำตัวที่มี ID นี้' },
        { status: 404 }
      );
    }

    return NextResponse.json(chronicDisease);
  } catch (error) {
    console.error('[GET_CHRONIC_DISEASE_BY_ID_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรคประจำตัว' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: แก้ไข PetChronicDisease ตาม ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนแก้ไขโรคประจำตัว' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const diseaseId = parseInt(id);

    if (isNaN(diseaseId)) {
      return NextResponse.json(
        { message: 'ID โรคประจำตัวไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ดึงข้อมูล
    const {  disease, description, diagnosedAt } = await request.json();

    // ตรวจสอบข้อมูล
    if (!disease) {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อโรค' },
        { status: 400 }
      );
    }
    
    if (diagnosedAt && isNaN(Date.parse(diagnosedAt))) {
      return NextResponse.json(
        { message: 'วันที่วินิจฉัยไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า diseaseId มีอยู่
    const existingDisease = await prisma.petChronicDisease.findUnique({
      where: { id: diseaseId },
    });
    if (!existingDisease) {
      return NextResponse.json(
        { message: 'ไม่พบโรคประจำตัวที่มี ID นี้' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า petId มีอยู่ถ้ามีการส่งมา
    

    // อัปเดต PetChronicDisease
    const chronicDisease = await prisma.petChronicDisease.update({
      where: { id: diseaseId },
      data: {
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

    return NextResponse.json(chronicDisease);
  } catch (error) {
    console.error('[PUT_CHRONIC_DISEASE_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการแก้ไขโรคประจำตัว', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบ PetChronicDisease ตาม ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนลบโรคประจำตัว' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const diseaseId = parseInt(id);

    if (isNaN(diseaseId)) {
      return NextResponse.json(
        { message: 'ID โรคประจำตัวไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า diseaseId มีอยู่
    const existingDisease = await prisma.petChronicDisease.findUnique({
      where: { id: diseaseId },
    });
    if (!existingDisease) {
      return NextResponse.json(
        { message: 'ไม่พบโรคประจำตัวที่มี ID นี้' },
        { status: 404 }
      );
    }

    // ลบ PetChronicDisease
    await prisma.petChronicDisease.delete({
      where: { id: diseaseId },
    });

    return NextResponse.json({ message: 'ลบโรคประจำตัวสำเร็จ' });
  } catch (error) {
    console.error('[DELETE_CHRONIC_DISEASE_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบโรคประจำตัว', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล VaccineRecord ทั้งหมด (กรองตาม petId ได้)
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

    const vaccineRecords = await prisma.vaccineRecord.findMany({
      where,
      select: {
        id: true,
        petId: true,
        vaccine: true,
        date: true,
        nextDue: true,
        note: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(vaccineRecords);
  } catch (error) {
    console.error('[GET_VACCINE_RECORDS_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกวัคซีน' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: เพิ่ม VaccineRecord ใหม่
export async function POST(request: Request) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนเพิ่มบันทึกวัคซีน' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก JSON body
    const { petId, vaccine, date, nextDue, note } = await request.json();

    // ตรวจสอบข้อมูล
    if (!petId || !vaccine || !date) {
      return NextResponse.json(
        { message: 'กรุณาระบุ petId, ชื่อวัคซีน, และวันที่ฉีด' },
        { status: 400 }
      );
    }
    if (isNaN(parseInt(petId))) {
      return NextResponse.json(
        { message: 'petId ไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    if (isNaN(Date.parse(date))) {
      return NextResponse.json(
        { message: 'วันที่ฉีดไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    if (nextDue && isNaN(Date.parse(nextDue))) {
      return NextResponse.json(
        { message: 'วันครบกำหนดครั้งถัดไปไม่ถูกต้อง' },
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

    // ตรวจสอบ permission: ผู้ใช้ต้องเป็นเจ้าของสัตว์เลี้ยง
    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์จัดการสัตว์เลี้ยงนี้' },
        { status: 403 }
      );
    }

    // สร้าง VaccineRecord
    const vaccineRecord = await prisma.vaccineRecord.create({
      data: {
        petId: parseInt(petId),
        vaccine,
        date: new Date(date),
        nextDue: nextDue ? new Date(nextDue) : null,
        note: note || null,
      },
      select: {
        id: true,
        petId: true,
        vaccine: true,
        date: true,
        nextDue: true,
        note: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(vaccineRecord, { status: 201 });
  } catch (error) {
    console.error('[POST_VACCINE_RECORD_ERROR]', error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มบันทึกวัคซีน', error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
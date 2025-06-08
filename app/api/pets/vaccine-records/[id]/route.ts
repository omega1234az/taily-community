import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// GET: ดึงข้อมูล VaccineRecord ตาม ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { message: 'ID บันทึกวัคซีนไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const vaccineRecord = await prisma.vaccineRecord.findUnique({
      where: { id: recordId },
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

    if (!vaccineRecord) {
      return NextResponse.json(
        { message: 'ไม่พบบันทึกวัคซีนที่มี ID นี้' },
        { status: 404 }
      );
    }

    return NextResponse.json(vaccineRecord);
  } catch (error) {
    console.error('[GET_VACCINE_RECORD_BY_ID_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกวัคซีน' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: แก้ไข VaccineRecord ตาม ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนแก้ไขบันทึกวัคซีน' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { message: 'ID บันทึกวัคซีนไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจาก JSON body
    const { vaccine, date, nextDue, note } = await request.json();

    // ตรวจสอบข้อมูล
    if (!vaccine || !date) {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อวัคซีนและวันที่ฉีด' },
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

    // ตรวจสอบว่า recordId มีอยู่
    const existingRecord = await prisma.vaccineRecord.findUnique({
      where: { id: recordId },
      include: { pet: true },
    });
    if (!existingRecord) {
      return NextResponse.json(
        { message: 'ไม่พบบันทึกวัคซีนที่มี ID นี้' },
        { status: 404 }
      );
    }

    // ตรวจสอบ permission: ผู้ใช้ต้องเป็นเจ้าของสัตว์เลี้ยง
    if (existingRecord.pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์จัดการสัตว์เลี้ยงนี้' },
        { status: 403 }
      );
    }

  
    

    // อัปเดต VaccineRecord
    const vaccineRecord = await prisma.vaccineRecord.update({
      where: { id: recordId },
      data: {
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

    return NextResponse.json(vaccineRecord);
  } catch (error) {
    console.error('[PUT_VACCINE_RECORD_ERROR]', error);
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการแก้ไขบันทึกวัคซีน', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบ VaccineRecord ตาม ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนลบบันทึกวัคซีน' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json(
        { message: 'ID บันทึกวัคซีนไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า recordId มีอยู่
    const existingRecord = await prisma.vaccineRecord.findUnique({
      where: { id: recordId },
      include: { pet: true },
    });
    if (!existingRecord) {
      return NextResponse.json(
        { message: 'ไม่พบบันทึกวัคซีนที่มี ID นี้' },
        { status: 404 }
      );
    }

    // ตรวจสอบ permission: ผู้ใช้ต้องเป็นเจ้าของสัตว์เลี้ยง
    if (existingRecord.pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์จัดการสัตว์เลี้ยงนี้' },
        { status: 403 }
      );
    }

    // ลบ VaccineRecord
    await prisma.vaccineRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ message: 'ลบบันทึกวัคซีนสำเร็จ' });
  } catch (error) {
    console.error('[DELETE_VACCINE_RECORD_ERROR]', error);
    return NextResponse.json(
      { 
        message: 'เกิดข้อผิดพลาดในการลบบันทึกวัคซีน', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
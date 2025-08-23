import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔹 ดึง LostPet ตาม ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lostPet = await prisma.lostPet.findUnique({
  where: { id: Number(await params.id) },
  include: {
    pet: {
      include: {
        images: true, // รูปสัตว์เลี้ยง
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        image: true, // เลือกเฉพาะ field ที่ไม่ sensitive
      },
    },
    images: true, // รูปประกาศสัตว์หาย
    clues: {
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true, // ป้องกันไม่ให้หลุด email/phone/password
          },
        },
      },
    },
  },
})



    if (!lostPet) {
      return NextResponse.json({ message: 'ไม่พบข้อมูล' }, { status: 404 })
    }

    return NextResponse.json(lostPet)
  } catch (error) {
    return NextResponse.json({ message: 'เกิดข้อผิดพลาด', error }, { status: 500 })
  }
}

// 🔹 อัปเดต LostPet
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const updated = await prisma.lostPet.update({
      where: { id: Number(params.id) },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'ไม่สามารถอัปเดตข้อมูลได้', error }, { status: 500 })
  }
}

// 🔹 ลบ LostPet


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // อ่าน status จาก body ของ request
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: 'กรุณาส่งค่า status ด้วย' }, { status: 400 });
    }

    const updatedPet = await prisma.lostPet.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ 
      message: `อัพเดทสถานะเป็น ${status} เรียบร้อยแล้ว`,
      status: updatedPet.status
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'ไม่สามารถอัพเดทสถานะได้', error },
      { status: 500 }
    );
  }
}

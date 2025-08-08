import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔹 ดึง LostPet ตาม ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lostPet = await prisma.lostPet.findUnique({
      where: { id: Number(params.id) },
      include: {
        pet: true,
        user: true,
        images: true,
        clues: true,
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
    await prisma.lostPet.delete({
      where: { id: Number(params.id) },
    })

    return NextResponse.json({ message: 'ลบเรียบร้อยแล้ว' })
  } catch (error) {
    return NextResponse.json({ message: 'ไม่สามารถลบข้อมูลได้', error }, { status: 500 })
  }
}

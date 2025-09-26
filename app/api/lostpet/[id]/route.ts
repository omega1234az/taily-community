import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔹 ดึง LostPet ตาม ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const lostPet = await prisma.lostPet.findUnique({
      where: { id: Number(id) },
      include: {
        pet: {
          include: {
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: true,
        
      },
    })

    if (!lostPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })
    }

    // เพิ่ม views +1
    await prisma.lostPet.update({
      where: { id: Number(id) },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(lostPet)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { options } from '../../../auth/[...nextauth]/option' // ปรับ path ให้ตรงกับโปรเจกต์

const prisma = new PrismaClient()

// ฟังก์ชันช่วยตรวจสอบเจ้าของโพสต์
async function checkOwnership(userId: string, postId: number) {
  const post = await prisma.lostPet.findUnique({
    where: { id: postId },
  })
  if (!post) return { error: 'ไม่พบโพสต์', status: 404 }
  if (post.userId !== userId) return { error: 'ไม่สามารถแก้ไขโพสต์ของผู้อื่น', status: 403 }
  return { post }
}
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(options)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    // ตรวจสอบเจ้าของโพสต์
    const lostPet = await prisma.lostPet.findUnique({
      where: { id: Number(id) },
    })

    if (!lostPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 })
    }

    if (lostPet.userId !== session.user.id) {
      return NextResponse.json({ message: "ไม่สามารถดูโพสต์ของผู้อื่นได้", status: 403 })
    }

    // ดึงข้อมูลเต็ม
    const result = await prisma.lostPet.findUnique({
      where: { id: Number(id) },
      include: {
        pet: { include: { images: true } },
        user: { select: { id: true, name: true, image: true } },
        images: true,
        clues: {
          include: {
            images: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    // เพิ่ม views +1 (ถ้าต้องการ)
    await prisma.lostPet.update({
      where: { id: Number(id) },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error }, { status: 500 })
  }
}

// 🔹 อัปเดต LostPet
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(options)
    if (!session || !session.user?.id) {
  return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
}
    if (!session) return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })

    const ownership = await checkOwnership(session.user.id, Number(id))
    if (ownership.error) return NextResponse.json({ message: ownership.error }, { status: ownership.status })

    const data = await req.json()
    const updated = await prisma.lostPet.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'ไม่สามารถอัปเดตข้อมูลได้', error }, { status: 500 })
  }
}

// 🔹 ต่ออายุ LostPet
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(options)
    
    if (!session) return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
    }
    const ownership = await checkOwnership(session.user.id, Number(id))
    if (ownership.error) return NextResponse.json({ message: ownership.error }, { status: ownership.status })

    const data = await req.json()
    const { createdAt } = data
    if (!createdAt) return NextResponse.json({ message: 'กรุณาระบุ createdAt สำหรับการต่ออายุ' }, { status: 400 })

    const updated = await prisma.lostPet.update({
      where: { id: Number(id) },
      data: { createdAt: new Date(createdAt) },
    })

    return NextResponse.json({ message: 'ต่ออายุโพสต์สำเร็จ', updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'ไม่สามารถต่ออายุโพสต์ได้', error }, { status: 500 })
  }
}

// 🔹 ลบ LostPet
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(options)
    if (!session) return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 })
    }
    const ownership = await checkOwnership(session.user.id, Number(id))
    if (ownership.error) return NextResponse.json({ message: ownership.error }, { status: ownership.status })

    const body = await req.json()
    const { status } = body
    if (!status) return NextResponse.json({ message: 'กรุณาส่งค่า status ด้วย' }, { status: 400 })

    const updatedPet = await prisma.lostPet.update({
      where: { id: Number(id) },
      data: { status },
    })

    return NextResponse.json({ message: `อัพเดทสถานะเป็น ${status} เรียบร้อยแล้ว`, status: updatedPet.status })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'ไม่สามารถอัพเดทสถานะได้', error }, { status: 500 })
  }
}

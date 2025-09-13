import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client';
import { del } from '@vercel/blob';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ ต้อง await
    const { id } = await context.params;
    const foundPetId = parseInt(id);

    if (isNaN(foundPetId)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const foundPet = await prisma.foundPet.findUnique({
      where: { id: foundPetId },
      include: {
        images: true,
        user: { select: { id: true, name: true, image: true } },
        species: true,
      },
    });

    if (!foundPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์ที่ระบุ" }, { status: 404 });
    }

    await prisma.foundPet.update({
      where: { id: foundPetId },
      data: { views: foundPet.views + 1 },
    });

    return NextResponse.json({ data: foundPet }, { status: 200 });
  } catch (error) {
    console.error("Error fetching found pet:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // ✅ ต้อง await
    const { id } = await context.params;
    const foundPetId = parseInt(id);

    if (isNaN(foundPetId)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const existingFoundPet = await prisma.foundPet.findUnique({
      where: { id: foundPetId },
      include: { 
        images: { select: { url: true } },
        user: { select: { id: true } },
      },
    });

    if (!existingFoundPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์ที่ระบุ" }, { status: 404 });
    }
    if (existingFoundPet.user.id !== session.user.id) {
      return NextResponse.json({ message: "คุณไม่มีสิทธิ์ลบข้อมูลนี้" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      for (const image of existingFoundPet.images) {
        try {
          await del(image.url);
        } catch (error) {
          console.error(`Error deleting image ${image.url}:`, error);
        }
      }

      await tx.notification.deleteMany({
        where: { referenceType: 'found_pet', referenceId: foundPetId },
      });

      await tx.report.deleteMany({
        where: { referenceType: 'found_pet', referenceId: foundPetId },
      });

      await tx.foundPetImage.deleteMany({ where: { foundPetId } });

      await tx.foundPet.delete({ where: { id: foundPetId } });
    });

    return NextResponse.json({ message: "ลบข้อมูลสัตว์สำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting found pet:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลสัตว์" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

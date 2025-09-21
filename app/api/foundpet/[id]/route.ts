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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(options);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // Get ID from params
    const { id } = await context.params;
    const foundPetId = parseInt(id);

    if (isNaN(foundPetId)) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { status, createdAt } = body;

    if (!status || !createdAt) {
      return NextResponse.json({ message: "ต้องระบุ status และ createdAt" }, { status: 400 });
    }

    // Validate status
    if (status !== 'finding') {
      return NextResponse.json({ message: "สถานะต้องเป็น 'finding'" }, { status: 400 });
    }

    // Validate createdAt
    const newCreatedAt = new Date(createdAt);
    if (isNaN(newCreatedAt.getTime())) {
      return NextResponse.json({ message: "createdAt ไม่ถูกต้อง" }, { status: 400 });
    }

    // Check if the foundPet exists and belongs to the user
    const existingFoundPet = await prisma.foundPet.findUnique({
      where: { id: foundPetId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existingFoundPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์ที่ระบุ" }, { status: 404 });
    }

    if (existingFoundPet.userId !== session.user.id) {
      return NextResponse.json({ message: "คุณไม่มีสิทธิ์อัปเดตข้อมูลนี้" }, { status: 403 });
    }

    // Update the foundPet record
    const updatedFoundPet = await prisma.foundPet.update({
      where: { id: foundPetId },
      data: {
        status,
        createdAt: newCreatedAt,
        updatedAt: new Date(), // Update the updatedAt field as well
      },
      include: {
        images: true,
        user: { select: { id: true, name: true, image: true } },
        species: true,
      },
    });

    return NextResponse.json(
      { message: "ต่ออายุโพสต์สำเร็จ", data: updatedFoundPet },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating found pet:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลสัตว์" }, { status: 500 });
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
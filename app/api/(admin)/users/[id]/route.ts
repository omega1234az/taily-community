import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { options } from '../../../auth/[...nextauth]/option'; // ปรับ path ตามโครงสร้างโปรเจคต์ของคุณ

const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(), // จำกัดค่า role
  houseNumber: z.string().optional(),
  street: z.string().optional(),
  village: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  status: z.boolean().optional(), // เพิ่ม status field
});

async function checkAdmin(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

// PUT: อัพเดทข้อมูลผู้ใช้ (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    const { id } = await params;

    // ตรวจสอบ id
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Only include fields that were provided in the update
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        houseNumber: true,
        street: true,
        village: true,
        subDistrict: true,
        district: true,
        province: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        status: true, // มี status ใน select แล้ว
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.error('[PUT_USER_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบผู้ใช้ (admin only) - แต่ในความเป็นจริงจะ soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    const { id } = await params;

    // ตรวจสอบ id
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Soft delete: เปลี่ยน status เป็น false แทนการลบจริง
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: false,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ 
      message: 'User deactivated successfully',
      user: user
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.error('[DELETE_USER_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/[...nextauth]/option';

const prisma = new PrismaClient();

// Validation schemas
const createUserSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.string().default('user'),
  houseNumber: z.string().optional(),
  street: z.string().optional(),
  village: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  status: z.boolean().default(true), // เพิ่ม status field
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.string().optional(),
  houseNumber: z.string().optional(),
  street: z.string().optional(),
  village: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  status: z.boolean().optional(), // เพิ่ม status field
});

// Middleware to check admin role
async function checkAdmin(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }
  return null;
}

// POST: Create a new user (admin only)
export async function POST(req: NextRequest) {
  const adminCheck = await checkAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    // Hash password if provided
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }

    const user = await prisma.user.create({
      data: validatedData,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    console.error('[POST_USER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Retrieve users (with pagination and status filter, admin only)
export async function GET(req: NextRequest) {
  const adminCheck = await checkAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // เพิ่มการกรองตาม status
    const statusFilter = searchParams.get('status');
    const whereClause = statusFilter === null ? {} : {
      status: statusFilter === 'true'
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
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
          status: true, // เพิ่ม status ใน select
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET_USERS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Update a user (admin only, partial updates allowed)
export async function PUT(req: NextRequest) {
  const adminCheck = await checkAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Only include fields that were provided in the update
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(), // อัปเดต timestamp
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
        status: true, // เพิ่ม status ใน select
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('[PUT_USER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Soft delete a user (admin only) - เปลี่ยน status เป็น false
export async function DELETE(req: NextRequest) {
  const adminCheck = await checkAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('[DELETE_USER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
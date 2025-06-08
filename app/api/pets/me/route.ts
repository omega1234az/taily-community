// app/api/pets/my/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const pets = await prisma.pet.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        images: true,
        chronicDiseases: true,
        vaccines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pets);
  } catch (error) {
    console.error('[GET_MY_PETS]', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' }, { status: 500 });
  }
}

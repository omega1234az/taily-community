import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]/option';
import { put } from '@vercel/blob';
import sharp from 'sharp';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
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
    console.error('[GET_PETS_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: เพิ่มสัตว์เลี้ยงใหม่พร้อมรูปภาพ
export async function POST(request: Request) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนเพิ่มสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // ดึงข้อมูลจาก multipart/form-data
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const species = formData.get('species')?.toString();
    const breed = formData.get('breed')?.toString();
    const gender = formData.get('gender')?.toString();
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    const color = formData.get('color')?.toString();
    const description = formData.get('description')?.toString();
    const markings = formData.get('markings')?.toString();
    const isNeutered = formData.get('isNeutered') === 'true' ? 1 : 0;
    const images = formData.getAll('images') as File[];

    // ตรวจสอบข้อมูล
    if (!name || !species) {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อและประเภทของสัตว์เลี้ยง' },
        { status: 400 }
      );
    }
    if (age && (isNaN(age) || age < 0)) {
      return NextResponse.json(
        { message: 'อายุสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    if (images.length > 5) {
      return NextResponse.json(
        { message: 'สามารถอัปโหลดรูปภาพได้สูงสุด 5 รูป' },
        { status: 400 }
      );
    }

    // อัปโหลดและบีบอัดรูปภาพ
    const imageUrls: string[] = [];
    for (const image of images) {
      if (image && image.size > 0) {
        if (!image.type.startsWith('image/')) {
          return NextResponse.json(
            { message: 'ไฟล์ที่อัปโหลดต้องเป็นรูปภาพ' },
            { status: 400 }
          );
        }
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'ขนาดรูปภาพต้องไม่เกิน 5MB' },
            { status: 400 }
          );
        }

        // อ่านไฟล์เป็น Buffer
        const imgBuffer = Buffer.from(await image.arrayBuffer());

        // บีบอัดและปรับขนาดด้วย Sharp
        const compressedImgBuffer = await sharp(imgBuffer)
          .resize(500, 500, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 65,
            progressive: true,
          })
          .toBuffer();

        // สร้าง Blob จาก Buffer ที่บีบอัด
        const compressedBlob = new Blob([compressedImgBuffer], { type: 'image/jpeg' });

        // อัปโหลดไป Vercel Blob
        const fileName = `pet-${session.user.id}-${Date.now()}.jpg`;
        const { url } = await put(`pets/${session.user.id}/${fileName}`, compressedBlob, {
          access: 'public',
        });
        imageUrls.push(url);
      }
    }

    // สร้างสัตว์เลี้ยง
    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        gender,
        age,
        color,
        description,
        markings,
        isNeutered,
        user: {
          connect: { id: session.user.id },
        },
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        images: true,
        chronicDiseases: true,
        vaccines: true,
      },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error('[POST_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
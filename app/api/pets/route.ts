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
        species: {
          select: {
            id: true,
            name: true,
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
  }
}

// POST: เพิ่มสัตว์เลี้ยงใหม่พร้อมหลายรูปภาพ
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
    const speciesId = formData.get('speciesId') ? parseInt(formData.get('speciesId') as string) : undefined;
    const breed = formData.get('breed')?.toString();
    const gender = formData.get('gender')?.toString();
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    const colorRaw = formData.get('color')?.toString();
    const description = formData.get('description')?.toString();
    const markings = formData.get('markings')?.toString();
    const isNeuteredRaw = formData.get('isNeutered')?.toString();
    const images = formData.getAll('images') as File[];

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !speciesId) {
      return NextResponse.json(
        { message: 'กรุณาระบุชื่อและประเภทของสัตว์เลี้ยง' },
        { status: 400 }
      );
    }

    // ตรวจสอบ speciesId
    if (isNaN(speciesId)) {
      return NextResponse.json(
        { message: 'รหัสประเภทสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า speciesId มีอยู่
    const species = await prisma.petSpecies.findUnique({
      where: { id: speciesId },
    });
    if (!species) {
      return NextResponse.json(
        { message: 'ไม่พบประเภทสัตว์เลี้ยงที่ระบุ' },
        { status: 400 }
      );
    }

    // ตรวจสอบ age
    if (age !== undefined && (isNaN(age) || age < 0)) {
      return NextResponse.json(
        { message: 'อายุสัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบ isNeutered
    const isNeutered = isNeuteredRaw === 'true' ? 1 : isNeuteredRaw === 'false' ? 0 : undefined;
    if (isNeutered === undefined) {
      return NextResponse.json(
        { message: 'สถานะการทำหมันไม่ถูกต้อง ต้องเป็น true หรือ false' },
        { status: 400 }
      );
    }

    // ตรวจสอบ color (ต้องเป็น array หรือ undefined)
    let color;
    if (colorRaw) {
      try {
        color = JSON.parse(colorRaw);
        if (!Array.isArray(color) || !color.every(item => typeof item === 'string')) {
          throw new Error('Invalid array format');
        }
      } catch (error) {
        return NextResponse.json(
          { message: 'สีต้องอยู่ในรูปแบบ JSON array ของสตริง เช่น ["brown", "white"]' },
          { status: 400 }
        );
      }
    }

    // ตรวจสอบจำนวนรูปภาพ
    if (images.length > 5) {
      return NextResponse.json(
        { message: 'สามารถอัปโหลดรูปภาพได้สูงสุด 5 รูป' },
        { status: 400 }
      );
    }

    // ตรวจสอบและอัปโหลดรูปภาพ
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const imageUrls: string[] = [];
    for (const image of images) {
      if (image && image.size > 0) {
        if (!allowedImageTypes.includes(image.type)) {
          return NextResponse.json(
            { message: 'รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น' },
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
        species: {
          connect: { id: speciesId },
        },
        breed,
        gender,
        age,
        color: color ? JSON.stringify(color) : undefined,
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
        species: {
          select: {
            id: true,
            name: true,
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
  }
}
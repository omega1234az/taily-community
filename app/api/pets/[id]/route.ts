import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/option';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลสัตว์เลี้ยงโดย ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const petId = parseInt(id);

    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
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

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('[GET_PET_BY_ID_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: อัปเดตข้อมูลสัตว์เลี้ยงและรูปภาพ
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนแก้ไขข้อมูลสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // รอ params และแปลง id
    const { id } = await params;
    const petId = parseInt(id);

    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า pet มีอยู่และ user เป็นเจ้าของ
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true },
    });

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์แก้ไขสัตว์เลี้ยงนี้' },
        { status: 403 }
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
    const removeImageIds = formData.get('removeImageIds')?.toString()?.split(',').map(Number).filter(id => !isNaN(id)) || [];

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

    // อัปโหลดและบีบอัดรูปภาพใหม่
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

    // อัปเดตข้อมูลสัตว์เลี้ยงและรูปภาพ
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
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
        images: {
          deleteMany: { id: { in: removeImageIds } },
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

    // ลบรูปภาพเก่าจาก Vercel Blob
    if (removeImageIds.length > 0) {
      const imagesToDelete = await prisma.petImage.findMany({
        where: { id: { in: removeImageIds }, petId },
        select: { url: true },
      });
      for (const image of imagesToDelete) {
        await del(image.url);
      }
    }

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error('[PUT_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบสัตว์เลี้ยงและรูปภาพ
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนลบสัตว์เลี้ยง' },
        { status: 401 }
      );
    }

    // รอ params และแปลง id
    const { id } = await params;
    const petId = parseInt(id);

    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า pet มีอยู่และ user เป็นเจ้าของ
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true, images: { select: { url: true } } },
    });

    if (!pet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' },
        { status: 404 }
      );
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'คุณไม่มีสิทธิ์ลบสัตว์เลี้ยงนี้' },
        { status: 403 }
      );
    }

    // ลบรูปภาพจาก Vercel Blob
    for (const image of pet.images) {
      await del(image.url);
    }

    // ลบสัตว์เลี้ยง
    await prisma.pet.delete({
      where: { id: petId },
    });

    return NextResponse.json(
      { message: 'ลบสัตว์เลี้ยงสำเร็จ' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE_PET_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบสัตว์เลี้ยง' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
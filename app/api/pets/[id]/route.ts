import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/option';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';

const prisma = new PrismaClient();

// ----------------------------
// GET: ดึงข้อมูลสัตว์เลี้ยงโดย ID
// ----------------------------
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const petId = parseInt(id);

    if (isNaN(petId)) {
      return NextResponse.json({ message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
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

    if (!pet) {
      return NextResponse.json({ message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('[GET_PET_BY_ID_ERROR]', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง' }, { status: 500 });
  }
}

// ----------------------------
// PUT: อัปเดตข้อมูลสัตว์เลี้ยงแบบ Partial Update
// ----------------------------
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'กรุณา login ก่อนแก้ไขข้อมูลสัตว์เลี้ยง' }, { status: 401 });
    }

    const { id } = await params;
    const petId = parseInt(id);
    if (isNaN(petId)) {
      return NextResponse.json({ message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true },
    });

    if (!pet) {
      return NextResponse.json({ message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' }, { status: 404 });
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ message: 'คุณไม่มีสิทธิ์แก้ไขสัตว์เลี้ยงนี้' }, { status: 403 });
    }

    const formData = await request.formData();
    console.log('Received form data:', Object.fromEntries(formData.entries()));
    const updateData: any = {};
    const imageOperations: any = {};

    const name = formData.get('name')?.toString();
    if (name !== null && name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ message: 'ชื่อสัตว์เลี้ยงไม่สามารถเป็นค่าว่างได้' }, { status: 400 });
      }
      updateData.name = name;
    }

    const speciesIdRaw = formData.get('speciesId')?.toString();
    if (speciesIdRaw !== null && speciesIdRaw !== undefined) {
      const speciesId = parseInt(speciesIdRaw);
      if (isNaN(speciesId)) {
        return NextResponse.json({ message: 'ID ประเภทสัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
      }

      const speciesExists = await prisma.petSpecies.findUnique({ where: { id: speciesId } });
      if (!speciesExists) {
        return NextResponse.json({ message: 'ประเภทสัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
      }

      updateData.species = { connect: { id: speciesId } };
    }

    const breed = formData.get('breed')?.toString();
    if (breed !== null && breed !== undefined) {
      updateData.breed = breed || null;
    }

    const gender = formData.get('gender')?.toString();
    if (gender !== null && gender !== undefined) {
      updateData.gender = gender || null;
    }

    const ageRaw = formData.get('age')?.toString();
    if (ageRaw !== null && ageRaw !== undefined) {
      if (ageRaw === '') {
        updateData.age = null;
      } else {
        const age = parseInt(ageRaw);
        if (isNaN(age) || age < 0) {
          return NextResponse.json({ message: 'อายุสัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
        }
        updateData.age = age;
      }
    }

    const description = formData.get('description')?.toString();
    if (description !== null && description !== undefined) {
      updateData.description = description || null;
    }

    const markings = formData.get('markings')?.toString();
    if (markings !== null && markings !== undefined) {
      updateData.markings = markings || null;
    }

    const isNeuteredRaw = formData.get('isNeutered');
    const isNeutered = Number(isNeuteredRaw);
    if (isNeutered !== 0 && isNeutered !== 1) {
      return NextResponse.json(
        { message: 'สถานะการทำหมันไม่ถูกต้อง ต้องเป็น 0 หรือ 1' },
        { status: 400 }
      );
    }
    updateData.isNeutered = isNeutered;

    const colorRaw = formData.get('color');
    if (colorRaw !== null && colorRaw !== undefined) {
      if (colorRaw.toString() === '') {
        updateData.color = null;
      } else {
        try {
          const color = JSON.parse(colorRaw.toString());
          if (!Array.isArray(color) || !color.every(item => typeof item === 'string')) {
            return NextResponse.json(
              { message: 'สีต้องอยู่ในรูปแบบ JSON array ของสตริง เช่น ["brown", "white"]' },
              { status: 400 }
            );
          }
          updateData.color = color;
        } catch (error) {
          return NextResponse.json(
            { message: 'สีต้องอยู่ในรูปแบบ JSON array ของสตริง เช่น ["brown", "white"]' },
            { status: 400 }
          );
        }
      }
    }

    const images = formData.getAll('images') as File[];
    const removeImageIds = formData.get('removeImageIds')?.toString()?.split(',').map(Number).filter(id => !isNaN(id)) || [];

    if (images.length > 0 || removeImageIds.length > 0) {
      const currentImages = await prisma.petImage.count({ where: { petId } });
      const newImageCount = currentImages - removeImageIds.length + images.length;

      if (newImageCount > 5) {
        return NextResponse.json({ message: 'จำนวนรูปภาพทั้งหมดต้องไม่เกิน 5 รูป' }, { status: 400 });
      }

      if (removeImageIds.length > 0) {
        const imagesToDelete = await prisma.petImage.findMany({
          where: { id: { in: removeImageIds }, petId },
          select: { url: true },
        });

        imageOperations.deleteMany = { id: { in: removeImageIds } };

        for (const image of imagesToDelete) {
          try {
            await del(image.url);
          } catch (error) {
            console.warn('Failed to delete image from blob:', image.url, error);
          }
        }
      }

      if (images.length > 0) {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const imageUrls: string[] = [];

        for (const image of images) {
          if (image?.size > 0) {
            if (!allowedImageTypes.includes(image.type)) {
              return NextResponse.json(
                { message: 'รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น' },
                { status: 400 }
              );
            }
            if (image.size > 5 * 1024 * 1024) {
              return NextResponse.json({ message: 'ขนาดรูปภาพต้องไม่เกิน 5MB' }, { status: 400 });
            }

            try {
              const imgBuffer = Buffer.from(await image.arrayBuffer());
              const compressedImgBuffer = await sharp(imgBuffer)
                .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 65, progressive: true })
                .toBuffer();

              const compressedBlob = new Blob([new Uint8Array(compressedImgBuffer)], { type: 'image/jpeg' });
              const fileName = `pet-${session.user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
              const { url } = await put(`pets/${session.user.id}/${fileName}`, compressedBlob, { access: 'public' });
              imageUrls.push(url);
            } catch (error) {
              console.error('Error processing image:', error);
              return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' }, { status: 500 });
            }
          }
        }

        if (imageUrls.length > 0) {
          imageOperations.create = imageUrls.map((url) => ({ url }));
        }
      }

      if (Object.keys(imageOperations).length > 0) {
        updateData.images = imageOperations;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'ไม่มีข้อมูลที่จะอัปเดต' }, { status: 400 });
    }

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: updateData,
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

    let responseColor = null;
    if (updatedPet.color) {
      try {
        const parsedColor = JSON.parse(updatedPet.color as string);
        if (Array.isArray(parsedColor) && parsedColor.every(item => typeof item === 'string')) {
          responseColor = parsedColor;
        }
      } catch (error) {
        console.warn(`Invalid JSON in color for pet ID ${updatedPet.id}:`, updatedPet.color);
        responseColor = null;
      }
    }

    return NextResponse.json({
      ...updatedPet,
      message: 'อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ',
    });

  } catch (error) {
    console.error('[PUT_PET_ERROR]', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสัตว์เลี้ยง' }, { status: 500 });
  }
}


// ----------------------------
// DELETE: ลบสัตว์เลี้ยงและรูปภาพ
// ----------------------------
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'กรุณา login ก่อนลบสัตว์เลี้ยง' }, { status: 401 });
    }

    const { id } = await params;
    const petId = parseInt(id);
    if (isNaN(petId)) {
      return NextResponse.json({ message: 'ID สัตว์เลี้ยงไม่ถูกต้อง' }, { status: 400 });
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, userId: true, images: { select: { url: true } } },
    });

    if (!pet) {
      return NextResponse.json({ message: 'ไม่พบสัตว์เลี้ยงที่มี ID นี้' }, { status: 404 });
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ message: 'คุณไม่มีสิทธิ์ลบสัตว์เลี้ยงนี้' }, { status: 403 });
    }

    // ลบข้อมูลที่เกี่ยวข้อง
    await prisma.petImage.deleteMany({ where: { petId } });
    await prisma.vaccineRecord.deleteMany({ where: { petId } });
    await prisma.petChronicDisease.deleteMany({ where: { petId } });

    // ลบรูปภาพจาก Vercel Blob
    for (const image of pet.images) {
      try {
        await del(image.url);
      } catch (error) {
        console.warn('Failed to delete image from blob:', image.url, error);
      }
    }

    // ลบสัตว์เลี้ยง
    await prisma.pet.delete({ where: { id: petId } });

    return NextResponse.json({ message: 'ลบสัตว์เลี้ยงสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE_PET_ERROR]', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการลบสัตว์เลี้ยง' }, { status: 500 });
  }
}
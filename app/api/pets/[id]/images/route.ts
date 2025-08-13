import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { options } from '../../../auth/[...nextauth]/option';
import { del, put } from '@vercel/blob';
import sharp from 'sharp';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(options);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'กรุณา login ก่อนแก้ไขข้อมูล' },
        { status: 401 }
      );
    }

    // ✅ await params ก่อนใช้
    const { id } = await context.params;
    const petId = parseInt(id);
    console.log(petId);

    if (isNaN(petId)) {
      return NextResponse.json(
        { message: 'รหัสสัตว์เลี้ยงไม่ถูกต้อง', petId },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าสัตว์เลี้ยงมีอยู่และเป็นของ user นี้
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: session.user.id,
      },
      include: {
        images: true,
      },
    });

    if (!existingPet) {
      return NextResponse.json(
        { message: 'ไม่พบสัตว์เลี้ยงที่ระบุ หรือคุณไม่มีสิทธิ์แก้ไข' },
        { status: 404 }
      );
    }

    // ดึงข้อมูลจาก multipart/form-data
    const formData = await request.formData();
    const action = formData.get('action')?.toString();
    const imageId = formData.get('imageId')
      ? parseInt(formData.get('imageId') as string)
      : undefined;
    const newImages = formData.getAll('images') as File[];

    if (!action || !['add', 'replace', 'delete', 'setMain'].includes(action)) {
      return NextResponse.json(
        { message: 'กรุณาระบุ action ที่ถูกต้อง (add, replace, delete, setMain)' },
        { status: 400 }
      );
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // ฟังก์ชันอัปโหลดรูปใหม่
    const uploadImages = async (images: File[]): Promise<string[]> => {
      const imageUrls: string[] = [];

      for (const image of images) {
        if (image && image.size > 0) {
          if (!allowedImageTypes.includes(image.type)) {
            throw new Error('รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น');
          }

          if (image.size > 5 * 1024 * 1024) {
            throw new Error('ขนาดรูปภาพต้องไม่เกิน 5MB');
          }

          const imgBuffer = Buffer.from(await image.arrayBuffer());

          const compressedImgBuffer = await sharp(imgBuffer)
            .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 65, progressive: true })
            .toBuffer();

          const compressedBlob = new Blob([new Uint8Array(compressedImgBuffer)], {
            type: 'image/jpeg',
          });

          const fileName = `pet-${session.user.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}.jpg`;

          const { url } = await put(
            `pets/${session.user.id}/${fileName}`,
            compressedBlob,
            { access: 'public' }
          );

          imageUrls.push(url);
        }
      }

      return imageUrls;
    };

    // ฟังก์ชันลบรูปจาก Vercel Blob
    const deleteOldImages = async (imageUrls: string[]) => {
      for (const imageUrl of imageUrls) {
        try {
          const filename = imageUrl.split('/').pop();
          if (filename) {
            await del(`pets/${session.user.id}/${filename}`);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    };

    let updatedPet;

    switch (action) {
      case 'add':
        if (newImages.length === 0) {
          return NextResponse.json(
            { message: 'กรุณาเลือกรูปที่ต้องการเพิ่ม' },
            { status: 400 }
          );
        }

        if (existingPet.images.length + newImages.length > 4) {
          return NextResponse.json(
            { message: 'สามารถมีรูปได้ไม่เกิน 4 รูปรวมกัน' },
            { status: 400 }
          );
        }

        try {
          const uploadedUrls = await uploadImages(newImages);
          await prisma.petImage.createMany({
            data: uploadedUrls.map((url) => ({
              url,
              petId,
              mainImage: false,
            })),
          });

          updatedPet = await prisma.pet.findUnique({
            where: { id: petId },
            include: {
              user: true,
              species: true,
              images: true,
              chronicDiseases: true,
              vaccines: true,
            },
          });
        } catch (error) {
          return NextResponse.json(
            {
              message:
                error instanceof Error
                  ? error.message
                  : 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ',
            },
            { status: 500 }
          );
        }
        break;

      case 'replace':
        if (!imageId) {
          return NextResponse.json(
            { message: 'กรุณาระบุ imageId ที่ต้องการแทนที่' },
            { status: 400 }
          );
        }

        if (newImages.length !== 1) {
          return NextResponse.json(
            { message: 'กรุณาเลือกรูปใหม่ 1 รูปสำหรับการแทนที่' },
            { status: 400 }
          );
        }

        const imageToReplace = existingPet.images.find(
          (img) => img.id === imageId
        );
        if (!imageToReplace) {
          return NextResponse.json(
            { message: 'ไม่พบรูปที่ต้องการแทนที่' },
            { status: 404 }
          );
        }

        try {
          const uploadedUrls = await uploadImages(newImages);
          await deleteOldImages([imageToReplace.url]);
          await prisma.petImage.update({
            where: { id: imageId },
            data: { url: uploadedUrls[0] },
          });

          updatedPet = await prisma.pet.findUnique({
            where: { id: petId },
            include: {
              user: true,
              species: true,
              images: true,
              chronicDiseases: true,
              vaccines: true,
            },
          });
        } catch (error) {
          return NextResponse.json(
            {
              message:
                error instanceof Error
                  ? error.message
                  : 'เกิดข้อผิดพลาดในการแทนที่รูปภาพ',
            },
            { status: 500 }
          );
        }
        break;
        case 'setMain':
        if (!imageId) {
          return NextResponse.json(
            { message: 'กรุณาระบุ imageId ที่ต้องการตั้งเป็นรูปหลัก' },
            { status: 400 }
          );
        }

        const imageToSetMain = existingPet.images.find(
          (img) => img.id === imageId
        );
        if (!imageToSetMain) {
          return NextResponse.json(
            { message: 'ไม่พบรูปที่ต้องการตั้งเป็นรูปหลัก' },
            { status: 404 }
          );
        }

        try {
          // เอา mainImage ออกทั้งหมดก่อน
          await prisma.petImage.updateMany({
            where: { petId },
            data: { mainImage: false },
          });

          // ตั้งรูปที่เลือกเป็น mainImage
          await prisma.petImage.update({
            where: { id: imageId },
            data: { mainImage: true },
          });

          updatedPet = await prisma.pet.findUnique({
            where: { id: petId },
            include: {
              user: true,
              species: true,
              images: true,
              chronicDiseases: true,
              vaccines: true,
            },
          });
        } catch (error) {
          return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการตั้งรูปหลัก' },
            { status: 500 }
          );
        }
        break;
      case 'delete':
        if (!imageId) {
          return NextResponse.json(
            { message: 'กรุณาระบุ imageId ที่ต้องการลบ' },
            { status: 400 }
          );
        }

        const imageToDelete = existingPet.images.find(
          (img) => img.id === imageId
        );
        if (!imageToDelete) {
          return NextResponse.json(
            { message: 'ไม่พบรูปที่ต้องการลบ' },
            { status: 404 }
          );
        }

        if (existingPet.images.length === 1) {
          return NextResponse.json(
            { message: 'ต้องมีรูปอย่างน้อย 1 รูป' },
            { status: 400 }
          );
        }

        try {
          await deleteOldImages([imageToDelete.url]);
          await prisma.petImage.delete({
            where: { id: imageId },
          });

          if (imageToDelete.mainImage) {
            const remainingImage = await prisma.petImage.findFirst({
              where: { petId },
              orderBy: { id: 'asc' },
            });
            if (remainingImage) {
              await prisma.petImage.update({
                where: { id: remainingImage.id },
                data: { mainImage: true },
              });
            }
          }

          updatedPet = await prisma.pet.findUnique({
            where: { id: petId },
            include: {
              user: true,
              species: true,
              images: true,
              chronicDiseases: true,
              vaccines: true,
            },
          });
        } catch (error) {
          return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการลบรูปภาพ' },
            { status: 500 }
          );
        }
        break;
    }

    // ✅ ป้องกัน undefined
    if (!updatedPet) {
      return NextResponse.json(
        { message: 'ไม่สามารถอัปเดตข้อมูลสัตว์เลี้ยงได้' },
        { status: 500 }
      );
    }

    // ✅ serialize และส่ง
    return NextResponse.json(JSON.parse(JSON.stringify(updatedPet)));
  } catch (error) {
    console.error('[PUT_PET_IMAGES_ERROR]', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการแก้ไขรูปภาพ' },
      { status: 500 }
    );
  }
}

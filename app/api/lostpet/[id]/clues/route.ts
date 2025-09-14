import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { getServerSession } from 'next-auth'
import { options } from '../../../auth/[...nextauth]/option';
import sharp from "sharp";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ รับเป็น Promise
) {
  try {
    const session = await getServerSession(options);
    
        if (!session || !session.user || !session.user.id) {
          return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
        }
    const { id } = await context.params; // ✅ ต้อง await
    const lostPetId = Number(id);

    // Check Content-Type header
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { message: "ต้องส่งข้อมูลในรูปแบบ multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const witnessName = formData.get("witnessName")?.toString();
    const contactDetails = formData.get("contactDetails")?.toString();
    const sightingDetails = formData.get("sightingDetails")?.toString();
    const location = formData.get("location")?.toString();
    const lat = formData.get("lat")?.toString();
    const lng = formData.get("lng")?.toString();
    const images = formData.getAll("images") as File[];

    if (!witnessName || !contactDetails || !sightingDetails) {
      return NextResponse.json(
        { message: "กรุณาระบุชื่อผู้พบเห็น รายละเอียดการติดต่อ และรายละเอียดการพบเห็น" },
        { status: 400 }
      );
    }

    if (isNaN(lostPetId)) {
      return NextResponse.json({ message: "รหัสสัตว์เลี้ยงไม่ถูกต้อง" }, { status: 400 });
    }

    const lostPet = await prisma.lostPet.findUnique({
      where: { id: lostPetId },
    });
    if (!lostPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์เลี้ยงหาย" }, { status: 404 });
    }

    const parsedLat = lat ? parseFloat(lat) : null;
    const parsedLng = lng ? parseFloat(lng) : null;

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const imageUrls: string[] = [];

    if (images.length > 4) {
      return NextResponse.json(
        { message: "สามารถอัปโหลดรูปได้ไม่เกิน 4 รูป" },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (image && image.size > 0) {
        if (!allowedImageTypes.includes(image.type)) {
          return NextResponse.json(
            { message: "รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น" },
            { status: 400 }
          );
        }
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: "ขนาดรูปภาพต้องไม่เกิน 5MB" },
            { status: 400 }
          );
        }

        const imgBuffer = Buffer.from(await image.arrayBuffer());
        const compressedImgBuffer = await sharp(imgBuffer)
          .resize(500, 500, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 65, progressive: true })
          .toBuffer();

        const compressedBlob = new Blob([new Uint8Array(compressedImgBuffer)], { type: "image/jpeg" });

        const fileName = `clue-anonymous-${lostPetId}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.jpg`;

        const { url } = await put(
          `clues/anonymous/${lostPetId}/${fileName}`,
          compressedBlob,
          {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }
        );

        imageUrls.push(url);
      }
    }

    const clue = await prisma.clue.create({
  data: {
    content: sightingDetails,
    location: location || null,
    lat: parsedLat,
    lng: parsedLng,
    witnessName,
    contactDetails,
    userId: session.user.id,
    lostPetId: lostPetId, 
    images: { create: imageUrls.map((url) => ({ url })) },
  },
  include: { images: true },
});

    await prisma.notification.create({
      data: {
        userId: lostPet.userId,
        title: "มีเบาะแสใหม่เกี่ยวกับสัตว์เลี้ยงของคุณ",
        message: `${witnessName || "มีผู้พบเห็น"} รายงานเบาะแสใหม่: ${sightingDetails.substring(
          0,
          50
        )}...`,
        type: "new_clue",
        linkUrl: `/eggtunmissing/${lostPetId}`,
        referenceId: clue.id,
        referenceType: "clue",
      },
    });

    return NextResponse.json(
      { message: "เพิ่มเบาะแสสำเร็จ", data: clue },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST_CLUE_ERROR]", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเพิ่มเบาะแส" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

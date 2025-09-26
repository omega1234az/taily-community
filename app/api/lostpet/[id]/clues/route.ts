import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { getServerSession } from 'next-auth';
import { options } from '../../../auth/[...nextauth]/option';
import sharp from "sharp";
import { sendEmail } from '../../../../lib/mail';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(options);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
    }
    
    const { id } = await context.params;
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
      include: { user: { select: { email: true } } }
    });
    
    if (!lostPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์เลี้ยงหาย" }, { status: 404 });
    }
    if (lostPet.userId === session.user.id) {
  return NextResponse.json(
    { message: "ไม่สามารถแจ้งเบาะแสสัตว์เลี้ยงของตัวเองได้" },
    { status: 400 }
  );
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
        message: `${witnessName || "มีผู้พบเห็น"} รายงานเบาะแสใหม่: ${sightingDetails.substring(0, 50)}...`,
        type: "new_clue",
        linkUrl: `/eggtunmissing/${lostPetId}`,
        referenceId: clue.id,
        referenceType: "clue",
      },
    });

    // ส่งอีเมลแจ้งเตือน (ถ้ามีอีเมล)
    if (lostPet.user.email) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const clueUrl = `${baseUrl}/eggtunmissing/${lostPetId}`;

      const emailSubject = 'มีเบาะแสใหม่เกี่ยวกับสัตว์เลี้ยงของคุณ';
      const emailBody = `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://os2n2mjwpet03yzg.public.blob.vercel-storage.com/logo/logo-4izV1a2OKdVPL0l9W4qppuA3ZWZIMo.png" alt="Logo" style="width: 80px; height: auto;" />
          </div>

          <div style="background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <h2 style="color: #333333;">มีเบาะแสใหม่เกี่ยวกับสัตว์เลี้ยงของคุณ</h2>
         
            <p style="color: #555;">มีเบาะแสใหม่เกี่ยวกับสัตว์เลี้ยงของคุณจาก ${witnessName || "ผู้พบเห็น"}:</p>
            <p style="color: #555;">"${sightingDetails.substring(0, 100)}..."</p>


            <p style="text-align: center; margin: 30px 0;">
              <a 
                href="${clueUrl}" 
                style="background-color: #FFBA60; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;"
              >
                ดูรายละเอียดเบาะแส
              </a>
            </p>

            <p style="color: #555;">หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างแล้ววางในเบราว์เซอร์ของคุณ:</p>
            <p style="word-break: break-all; color: #0066cc;">${clueUrl}</p>

            <p style="color: #999; font-size: 14px;">หากคุณมีคำถาม กรุณาติดต่อ ${contactDetails}</p>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
            อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
          </p>
        </div>
      `;

      await sendEmail({
        to: lostPet.user.email,
        subject: emailSubject,
        html: emailBody
      });
    } else {
      console.warn(`[WARNING] ไม่สามารถส่งอีเมลแจ้งเตือนได้: ผู้ใช้ ${lostPet.userId} ไม่มีอีเมล`);
    }

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
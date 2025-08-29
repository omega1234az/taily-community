
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import sharp from "sharp";

const prisma = new PrismaClient();

// 🔹 POST: Create a new clue for a LostPet (unauthenticated)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check Content-Type header
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      console.error("[POST_CLUE_ERROR] Invalid Content-Type:", contentType);
      return NextResponse.json(
        { message: "ต้องส่งข้อมูลในรูปแบบ multipart/form-data" },
        { status: 400 }
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("[POST_CLUE_ERROR] Failed to parse formData:", error);
      return NextResponse.json(
        { message: "ไม่สามารถ解析ข้อมูลฟอร์มได้ กรุณาตรวจสอบรูปแบบข้อมูล" },
        { status: 400 }
      );
    }

    const witnessName = formData.get("witnessName")?.toString();
    const contactDetails = formData.get("contactDetails")?.toString();
    const sightingDetails = formData.get("sightingDetails")?.toString();
    const location = formData.get("location")?.toString();
    const lat = formData.get("lat")?.toString();
    const lng = formData.get("lng")?.toString();
    const images = formData.getAll("images") as File[];

    // Log form data for debugging
    console.log("[POST_CLUE_DEBUG] FormData:", {
      witnessName,
      contactDetails,
      sightingDetails,
      lat,
      lng,
      imageCount: images.length,
    });

    // Validate required fields
    if (!witnessName || !contactDetails || !sightingDetails) {
      return NextResponse.json(
        { message: "กรุณาระบุชื่อผู้พบเห็น รายละเอียดการติดต่อ และรายละเอียดการพบเห็น" },
        { status: 400 }
      );
    }

    // Validate LostPet exists
    const lostPetId = Number(params.id);
    if (isNaN(lostPetId)) {
      return NextResponse.json({ message: "รหัสสัตว์เลี้ยงไม่ถูกต้อง" }, { status: 400 });
    }
    const lostPet = await prisma.lostPet.findUnique({
      where: { id: lostPetId },
    });
    if (!lostPet) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสัตว์เลี้ยงหาย" }, { status: 404 });
    }

    // Parse and validate lat and lng if provided
    const parsedLat = lat ? parseFloat(lat) : null;
    const parsedLng = lng ? parseFloat(lng) : null;
   

    // Validate and upload images
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const imageUrls: string[] = [];
    if (images.length > 4) {
      return NextResponse.json({ message: "สามารถอัปโหลดรูปได้ไม่เกิน 4 รูป" }, { status: 400 });
    }

    for (const image of images) {
      if (image && image.size > 0) {
        // Check image type
        if (!allowedImageTypes.includes(image.type)) {
          return NextResponse.json(
            { message: "รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น" },
            { status: 400 }
          );
        }

        // Check image size
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: "ขนาดรูปภาพต้องไม่เกิน 5MB" },
            { status: 400 }
          );
        }

        try {
          // Read file as Buffer
          const imgBuffer = Buffer.from(await image.arrayBuffer());

          // Compress and resize with Sharp
          const compressedImgBuffer = await sharp(imgBuffer)
            .resize(500, 500, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({
              quality: 65,
              progressive: true,
            })
            .toBuffer();

          // Create Blob from compressed Buffer
          const compressedBlob = new Blob([new Uint8Array(compressedImgBuffer)], { type: "image/jpeg" });

          // Upload to Vercel Blob
          const fileName = `clue-anonymous-${lostPetId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
          const { url } = await put(`clues/anonymous/${lostPetId}/${fileName}`, compressedBlob, {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });

          imageUrls.push(url);
        } catch (uploadError) {
          console.error("[POST_CLUE_ERROR] Image upload error:", uploadError);
          return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" },
            { status: 500 }
          );
        }
      }
    }

    // Create Clue with associated images
    const clue = await prisma.clue.create({
      data: {
        content: sightingDetails,
        location: location || null,
        lat: parsedLat,
        lng: parsedLng,
        witnessName,
        contactDetails,
       
        lostPet: {
          connect: { id: lostPetId },
        },
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      {
        message: "เพิ่มเบาะแสสำเร็จ",
        data: clue,
      },
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

'use server';

import { getServerSession } from "next-auth";

import { options } from "../api/auth/[...nextauth]/option";
const prisma = new PrismaClient();
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import sharp from "sharp";

// ดึงข้อมูล user จาก session แล้วหาใน DB
export async function getUserProfile() {
  const session = await getServerSession(options);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
      phone: true,
      houseNumber: true,
      street: true,
      village: true,
      subDistrict: true,
      district: true,
      province: true
    }
  });

  return user;
}

// อัปเดตข้อมูล user
export async function saveProfile(formData: FormData) {
  const session = await getServerSession(options);
  if (!session?.user?.email) return { success: false, message: "No session" };

  try {
    // อ่านไฟล์รูปภาพ (ถ้ามี)
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      // แปลงไฟล์เป็น Buffer
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // บีบอัดรูปด้วย sharp (ปรับขนาดและคุณภาพ)
      const compressedBuffer = await sharp(buffer)
        .resize(500, 500, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 70, progressive: true })
        .toBuffer();

      // ตั้งชื่อไฟล์ใหม่แบบสุ่ม
      const datetime = Date.now();
      const fileName = `profiles/profile-${session.user.email}-${datetime}.jpg`;

      // อัปโหลดไป Vercel Blob
      const blob = await put(fileName, compressedBuffer, {
        access: "public",
        contentType: "image/jpeg",
        allowOverwrite: true
      });

      imageUrl = blob.url;
    }

    // อัปเดตฐานข้อมูล
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: formData.get("name")?.toString(),
        firstName: formData.get("firstName")?.toString(),
        lastName: formData.get("lastName")?.toString(),
        phone: formData.get("phone")?.toString(),
        houseNumber: formData.get("houseNumber")?.toString(),
        street: formData.get("street")?.toString(),
        village: formData.get("village")?.toString(),
        subDistrict: formData.get("subDistrict")?.toString(),
        district: formData.get("district")?.toString(),
        province: formData.get("province")?.toString(),
        ...(imageUrl ? { image: imageUrl } : {}), // อัปเดตรูปถ้ามี
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
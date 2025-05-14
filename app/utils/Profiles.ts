'use server';

import { getServerSession } from "next-auth";

import { options } from "../api/auth/[...nextauth]/option";
const prisma = new PrismaClient();
import { PrismaClient } from "@prisma/client";

// ดึงข้อมูล user จาก session แล้วหาใน DB
export async function getUserProfile() {
  const session = await getServerSession(options);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
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
export async function saveProfile(formData: any) {
  const session = await getServerSession(options);
  if (!session?.user?.email) return { success: false, message: "No session" };

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        houseNumber: formData.houseNumber,
        street: formData.street,
        village: formData.village,
        subDistrict: formData.subDistrict,
        district: formData.district,
        province: formData.province
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
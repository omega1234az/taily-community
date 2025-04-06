// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // รับข้อมูลจาก request body
    const body = await request.json();
    const { name, email, password, username } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email และ password จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าอีเมลนี้มีอยู่ในระบบแล้วหรือไม่
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า username นี้มีอยู่ในระบบแล้วหรือไม่ (ถ้ามีการส่ง username มา)
    if (username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUserByUsername) {
        return NextResponse.json(
          { message: "Username นี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // เข้ารหัสพาสเวิร์ด
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่รวมรหัสผ่าน)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      {
        message: "ลงทะเบียนสำเร็จ",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    );
  }
}
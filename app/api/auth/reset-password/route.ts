// api/auth/reset-password.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
const prisma = new PrismaClient();
  try {
    const { token, password } = await req.json();

    // ตรวจสอบข้อมูลที่ส่งมา
    if (!token || !password) {
      return NextResponse.json(
        { message: 'กรุณาระบุข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบความถูกต้องของรหัสผ่าน
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' },
        { status: 400 }
      );
    }

    // ค้นหา token ในฐานข้อมูล
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // ถ้าไม่พบ token หรือ token หมดอายุ
    if (!passwordResetToken || passwordResetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    // อัปเดตรหัสผ่านของผู้ใช้
    await prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { password: hashedPassword }
    });

    // ลบ token ที่ใช้แล้ว
    await prisma.passwordResetToken.delete({
      where: { id: passwordResetToken.id }
    });

    return NextResponse.json(
      { message: 'รีเซ็ตรหัสผ่านสำเร็จ' },
      { status: 200 }
    );
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
// api/auth/forgot-password.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { randomBytes } from 'crypto';
import { sendEmail } from '../../../lib/mail';
export async function POST(req: NextRequest) {
    const prisma = new PrismaClient();
    try {
        const { email } = await req.json();
        console.log('Received email:', email);
        // ตรวจสอบว่ามีการส่ง email หรือไม่
        if (!email) {
            return NextResponse.json(
                { message: 'กรุณาระบุอีเมล' },
                { status: 400 }
            );
        }

        // ค้นหาผู้ใช้จากอีเมล
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // ถ้าไม่พบผู้ใช้ ให้ส่งข้อความว่าส่งอีเมลสำเร็จ (เพื่อป้องกันการเดาอีเมล)
        if (!user) {
            return NextResponse.json(
                { message: 'ถ้าอีเมลนี้ลงทะเบียนในระบบ ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลดังกล่าว' },
                { status: 200 }
            );
        }

        // สร้าง token สำหรับรีเซ็ตรหัสผ่าน
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // token หมดอายุใน 1 ชั่วโมง

        // ลบ token เก่าของผู้ใช้ (ถ้ามี)
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id }
        });

        // สร้าง token ใหม่ในฐานข้อมูล
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        });

        // สร้าง URL สำหรับรีเซ็ตรหัสผ่าน
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        // เตรียมเนื้อหาอีเมล
        const emailSubject = 'รีเซ็ตรหัสผ่านของคุณ';
        const emailBody = `
  <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="http:localhost:3000/login/dog.png" alt="Logo" style="width: 80px; height: auto;" />
    </div>

    <div style="background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      <h2 style="color: #333333;">รีเซ็ตรหัสผ่านของคุณ</h2>
      <p style="color: #555;">คุณได้รับอีเมลนี้เนื่องจากมีการขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
      <p style="color: #555;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อดำเนินการรีเซ็ตรหัสผ่าน:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a 
          href="${resetUrl}" 
          style="background-color: #FFBA60; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;"
        >
          รีเซ็ตรหัสผ่าน
        </a>
      </p>

      <p style="color: #555;">หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างแล้ววางในเบราว์เซอร์ของคุณ:</p>
      <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>

      <p style="color: #999; font-size: 14px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
      <p style="color: #999; font-size: 14px;">หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลฉบับนี้</p>
    </div>

    <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
      อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
    </p>
  </div>
`;


        // ส่งอีเมล
        await sendEmail({
            to: user.email!,
            subject: emailSubject,
            html: emailBody
        });

        // ส่งการตอบกลับเป็น 200 OK
        return NextResponse.json(
            { message: 'ถ้าอีเมลนี้ลงทะเบียนในระบบ ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลดังกล่าว' },
            { status: 200 }
        );
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน:', error);
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
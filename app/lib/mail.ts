// lib/mail.ts
import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// กำหนดค่า transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false,
    ignoreTLS: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    debug: true, // เพิ่มเพื่อแสดงข้อมูลการดีบั๊ก
  });

// ฟังก์ชั่นสำหรับส่งอีเมล
export const sendEmail = async (payload: EmailPayload) => {
  try {
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...payload,
    });
    
    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่งอีเมล:', error);
    throw new Error('เกิดข้อผิดพลาดในการส่งอีเมล');
  }
};

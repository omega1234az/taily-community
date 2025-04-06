import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

// สร้าง instance ของ PrismaClient
const prisma = new PrismaClient();

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),  // ใช้ PrismaAdapter สำหรับฐานข้อมูล
  providers: [
    // Google Provider สำหรับการเข้าสู่ระบบด้วย Google
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),

    // Credentials Provider สำหรับการเข้าสู่ระบบด้วย Email/Password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ค้นหาผู้ใช้ในฐานข้อมูลจากอีเมล
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // หากไม่พบผู้ใช้ ให้คืนค่า null
        if (!user) {
          return null;
        }

        // ตรวจสอบว่า user.password มีค่าหรือไม่
        if (!user.password) {
          return null;
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        // หากรหัสผ่านไม่ถูกต้อง ให้คืนค่า null
        if (!isPasswordValid) {
          return null;
        }

        // คืนค่าผู้ใช้เมื่อการยืนยันตัวตนสำเร็จ
        return user;
      },
    }),
  ],
  session: {
    strategy: "database",  // ใช้ฐานข้อมูลสำหรับจัดการ session
    maxAge: 60 * 60 * 24,   // ตั้งเวลา session หมดอายุหลังจาก 24 ชั่วโมง (ในวินาที)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
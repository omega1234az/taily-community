import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"; 
import { options } from "../../auth/[...nextauth]/option"; // 👈 ตำแหน่งไฟล์ option.ts ของคุณ

const prisma = new PrismaClient();

// ✅ GET: ดึงรายงานทั้งหมด
// ✅ GET: ดึงรายงานทั้งหมด พร้อมข้อมูลโพสต์


// ✅ GET: ดึงรายงานทั้งหมด พร้อมข้อมูลโพสต์ + รูป
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
  where: {
    status: "pending", // เฉพาะ report ที่ status เป็น pending
  },
  orderBy: {
    createdAt: "desc",
  },
  include: {
    reporter: {
      select: { id: true, name: true, email: true, image: true },
    },
  },
});


    const reportsWithPost = await Promise.all(
      reports.map(async (report) => {
        let post: any = null;

        if (report.referenceType === "lost_pet") {
          post = await prisma.lostPet.findUnique({
            where: { id: report.referenceId },
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
              pet: {
                select: {
                  id: true,
                  name: true,
                  breed: true,
                  gender: true,
                  images: true, // ✅ รูปจาก PetImage
                },
              },
              images: true, // ✅ รูปจาก LostPetImage
            },
          });
        } else if (report.referenceType === "found_pet") {
          post = await prisma.foundPet.findUnique({
            where: { id: report.referenceId },
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
              species: true,
              images: true, // ✅ รูปจาก FoundPetImage
            },
          });
        }

        return { ...report, post };
      })
    );

    return NextResponse.json(reportsWithPost, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "ไม่สามารถดึงข้อมูลรายงานได้", error: error.message },
      { status: 500 }
    );
  }
}


// ✅ POST: สร้างรายงานใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนส่งรายงาน" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { referenceType, referenceId, reason, details } = body;

    if (!referenceType || !referenceId || !reason) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id, // ✅ ใช้จาก session โดยตรง
        referenceType,
        referenceId,
        reason,
        details,
      },
    });

    return NextResponse.json(
      { message: "ส่งรายงานสำเร็จ", report },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "ไม่สามารถส่งรายงานได้", error: error.message },
      { status: 500 }
    );
  }
}

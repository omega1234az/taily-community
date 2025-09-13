// api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const reportId = parseInt(params.id);
    const body = await request.json();
    const { status } = body; // ตัวอย่าง: "hidden", "reviewed", "pending"

    if (!status) {
      return NextResponse.json({ message: "ต้องส่ง status" }, { status: 400 });
    }

    // อัปเดต Report
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    // ถ้า status เป็น hidden ให้ปรับ status ของโพสต์ต้นทางด้วย
    if (status === "hidden") {
      if (updatedReport.referenceType === "lost_pet") {
        await prisma.lostPet.update({
          where: { id: updatedReport.referenceId },
          data: { status: "reported" }, // เปลี่ยนเป็น 0
        });
      } else if (updatedReport.referenceType === "found_pet") {
        await prisma.foundPet.update({
          where: { id: updatedReport.referenceId },
          data: { status: "0" }, // เปลี่ยนเป็น 0
        });
      }
    }

    return NextResponse.json({ message: "อัปเดตสำเร็จ", updatedReport });
  } catch (error: any) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { message: "ไม่สามารถอัปเดตรายงานได้", error: error.message },
      { status: 500 }
    );
  }
}


// DELETE เดิมก็ใช้งานได้ตามปกติ
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const reportId = parseInt(params.id);

    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json(
      { message: "ลบรายงานสำเร็จ" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { message: "ไม่สามารถลบรายงานได้", error: error.message },
      { status: 500 }
    );
  }
}

// api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ PUT: ปรับ status ของโพสต์ที่ถูก report


// ✅ DELETE: ลบรายงาน
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const reportId = parseInt(params.id);

    // ลบรายงาน
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

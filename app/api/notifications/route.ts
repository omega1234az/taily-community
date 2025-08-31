import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from '../auth/[...nextauth]/option';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* GET: ดึงการแจ้งเตือนของ user */
export async function GET(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: notifications });
}

/* PUT: Mark all as read */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const updated = await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false, isDeleted: false },
    data: { isRead: true },
  });

  return NextResponse.json({ message: "Marked all as read", count: updated.count });
}

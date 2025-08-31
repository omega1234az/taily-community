import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from '../../auth/[...nextauth]/option';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* PATCH: อ่านแจ้งเตือนทีละอัน */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const notifId = Number(params.id);
  const notif = await prisma.notification.findUnique({ where: { id: notifId } });

  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: notifId },
    data: { isRead: true },
  });

  return NextResponse.json({ message: "Marked as read", data: updated });
}

/* DELETE: ลบแจ้งเตือน */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const notifId = Number(params.id);
  const notif = await prisma.notification.findUnique({ where: { id: notifId } });

  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const deleted = await prisma.notification.update({
    where: { id: notifId },
    data: { isDeleted: true },
  });

  return NextResponse.json({ message: "Deleted", data: deleted });
}

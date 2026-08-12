import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { toPlain } from "@/lib/utils";

export async function PATCH(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { isRead } = await request.json();

  const message = await prisma.contactMessage.update({
    where: { id: Number(id) },
    data: { isRead: Boolean(isRead) },
  });

  return NextResponse.json({ message: toPlain(message) });
}

export async function DELETE(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}

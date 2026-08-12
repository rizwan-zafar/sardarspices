import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { validateContactMessage, hasErrors } from "@/lib/validation";
import { toPlain } from "@/lib/utils";

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter");
  const where = filter === "unread" ? { isRead: false } : filter === "read" ? { isRead: true } : {};

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ messages: toPlain(messages) });
}

export async function POST(request) {
  const data = await request.json();
  const errors = validateContactMessage(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const message = await prisma.contactMessage.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      subject: data.subject?.trim() || null,
      message: data.message.trim(),
    },
  });

  return NextResponse.json({ message: toPlain(message) }, { status: 201 });
}

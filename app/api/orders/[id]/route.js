import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { toPlain, ORDER_STATUSES } from "@/lib/utils";

export async function GET(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: { select: { id: true, name: true, slug: true } } } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order: toPlain(order) });
}

export async function PATCH(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  const { status } = await request.json();

  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 422 });
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existing.status === "CANCELLED" && status !== "CANCELLED") {
    return NextResponse.json(
      { error: "Cannot change status of a cancelled order." },
      { status: 400 }
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    // Restore stock only when transitioning INTO cancelled from a non-cancelled state.
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      for (const item of existing.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  });

  return NextResponse.json({ order: toPlain(order) });
}

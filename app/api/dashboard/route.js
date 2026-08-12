import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { toPlain } from "@/lib/utils";

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    unreadMessages,
    salesResult,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      unreadMessages,
      totalSales: salesResult._sum.totalAmount ? Number(salesResult._sum.totalAmount) : 0,
    },
    recentOrders: toPlain(recentOrders),
  });
}

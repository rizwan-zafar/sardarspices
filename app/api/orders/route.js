import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { generateOrderNumber, toPlain } from "@/lib/utils";
import { validateCheckout, hasErrors } from "@/lib/validation";
import { sendOrderEmails } from "@/lib/mail";

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Number(searchParams.get("pageSize")) || 15);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where = {
    ...(status && status !== "ALL" ? { status } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { customerName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: toPlain(orders),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const errors = validateCheckout(data);
    if (hasErrors(errors)) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
    }

    // Merge duplicate product entries and sanity-check quantities.
    const mergedItems = new Map();
    for (const item of data.items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item in cart. Please refresh your cart and try again." },
          { status: 422 }
        );
      }
      mergedItems.set(productId, (mergedItems.get(productId) || 0) + quantity);
    }

    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const [productId, quantity] of mergedItems) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product || product.status !== "ACTIVE") {
          throw new Error(`"${product?.name || "This item"}" is no longer available.`);
        }
        if (product.stock < quantity) {
          throw new Error(
            `Only ${product.stock} unit(s) of "${product.name}" left in stock. Please update your cart.`
          );
        }

        const updateResult = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updateResult.count === 0) {
          throw new Error(`"${product.name}" just went out of stock. Please update your cart.`);
        }

        const subtotal = Number(product.price) * quantity;
        total += subtotal;
        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          subtotal,
        });
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: data.customerName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          paymentMethod: "COD",
          status: "PENDING",
          totalAmount: total,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    });

    const plainOrder = toPlain(order);

    try {
      await sendOrderEmails(plainOrder);
    } catch (mailError) {
      console.error("Order email error:", mailError);
    }

    return NextResponse.json({ order: plainOrder }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Could not place order. Please try again." },
      { status: 400 }
    );
  }
}

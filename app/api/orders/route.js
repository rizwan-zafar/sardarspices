import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { generateOrderNumber, toPlain } from "@/lib/utils";
import { validateCheckout, hasErrors } from "@/lib/validation";
import { sendOrderEmails } from "@/lib/mail";
import { syncProductSummary } from "@/lib/product";

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

    const mergedItems = new Map();
    for (const item of data.items) {
      const productId = Number(item.productId);
      const variantId = Number(item.variantId);
      const quantity = Number(item.quantity);
      if (!productId || !variantId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item in cart. Please refresh your cart and try again." },
          { status: 422 }
        );
      }
      const key = `${productId}:${variantId}`;
      const current = mergedItems.get(key);
      mergedItems.set(key, {
        productId,
        variantId,
        quantity: (current?.quantity || 0) + quantity,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];
      const touchedProducts = new Set();

      for (const { productId, variantId, quantity } of mergedItems.values()) {
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true },
        });

        if (!variant || variant.productId !== productId || variant.product.status !== "ACTIVE") {
          throw new Error(`"${variant?.product?.name || "This item"}" is no longer available.`);
        }
        if (variant.stock < quantity) {
          throw new Error(
            `Only ${variant.stock} unit(s) of "${variant.product.name} (${variant.name})" left in stock. Please update your cart.`
          );
        }

        const updateResult = await tx.productVariant.updateMany({
          where: { id: variantId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updateResult.count === 0) {
          throw new Error(
            `"${variant.product.name} (${variant.name})" just went out of stock. Please update your cart.`
          );
        }

        touchedProducts.add(productId);

        const subtotal = Number(variant.price) * quantity;
        total += subtotal;
        orderItemsData.push({
          productId: variant.product.id,
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name,
          price: variant.price,
          quantity,
          subtotal,
        });
      }

      for (const productId of touchedProducts) {
        await syncProductSummary(tx, productId);
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

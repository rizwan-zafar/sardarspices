import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateProduct, hasErrors } from "@/lib/validation";

export async function GET(request, { params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product: toPlain(product) });
}

export async function PUT(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);
  const data = await request.json();
  const errors = validateProduct(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const category = await prisma.category.findUnique({ where: { id: Number(data.categoryId) } });
  if (!category) {
    return NextResponse.json({ error: "Validation failed", errors: { categoryId: "Category not found" } }, { status: 422 });
  }

  let slug = existing.slug;
  if (data.name.trim() !== existing.name) {
    slug = await ensureUniqueSlug(prisma.product, slugify(data.name), productId);
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      price: Number(data.price),
      stock: Number(data.stock),
      images: Array.isArray(data.images) ? data.images : existing.images,
      status: data.status || existing.status,
      categoryId: category.id,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json({ product: toPlain(product) });
}

export async function DELETE(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    // Preserve order history integrity — deactivate instead of hard delete.
    await prisma.product.update({ where: { id: productId }, data: { status: "INACTIVE" } });
    return NextResponse.json({
      success: true,
      message: "Product has existing orders, so it was deactivated instead of deleted.",
    });
  }

  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateCategory, hasErrors } from "@/lib/validation";

export async function GET(request, { params }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ category: toPlain(category) });
}

export async function PUT(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);
  const data = await request.json();
  const errors = validateCategory(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let slug = existing.slug;
  if (data.name.trim() !== existing.name) {
    slug = await ensureUniqueSlug(prisma.category, slugify(data.name), categoryId);
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      image: data.image || null,
      status: data.status || existing.status,
    },
  });

  return NextResponse.json({ category: toPlain(category) });
}

export async function DELETE(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = Number(id);

  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete category with ${productCount} product(s). Move or delete them first.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
  return NextResponse.json({ success: true });
}

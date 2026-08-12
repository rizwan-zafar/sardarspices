import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateProduct, hasErrors } from "@/lib/validation";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(48, Number(searchParams.get("pageSize")) || 12);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const includeInactive = searchParams.get("all") === "true";
  const sort = searchParams.get("sort") || "newest";

  const where = {
    ...(includeInactive ? {} : { status: "ACTIVE" }),
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? { name: { contains: search } }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "name"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products: toPlain(products),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const errors = validateProduct(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const category = await prisma.category.findUnique({ where: { id: Number(data.categoryId) } });
  if (!category) {
    return NextResponse.json({ error: "Validation failed", errors: { categoryId: "Category not found" } }, { status: 422 });
  }

  const baseSlug = slugify(data.name);
  const slug = await ensureUniqueSlug(prisma.product, baseSlug);

  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      price: Number(data.price),
      stock: Number(data.stock),
      images: Array.isArray(data.images) ? data.images : [],
      status: data.status || "ACTIVE",
      categoryId: category.id,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json({ product: toPlain(product) }, { status: 201 });
}

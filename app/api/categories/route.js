import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateCategory, hasErrors } from "@/lib/validation";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const includeInactive = searchParams.get("all") === "true";

  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ categories: toPlain(categories) });
}

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const errors = validateCategory(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const baseSlug = slugify(data.name);
  const slug = await ensureUniqueSlug(prisma.category, baseSlug);

  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      image: data.image || null,
      status: data.status || "ACTIVE",
    },
  });

  return NextResponse.json({ category: toPlain(category) }, { status: 201 });
}

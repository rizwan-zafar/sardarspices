import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateBlog, hasErrors } from "@/lib/validation";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const includeUnpublished = searchParams.get("all") === "true";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Number(searchParams.get("pageSize")) || 9);

  const where = includeUnpublished ? {} : { status: "PUBLISHED" };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blog.count({ where }),
  ]);

  return NextResponse.json({
    blogs: toPlain(blogs),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const errors = validateBlog(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const baseSlug = slugify(data.title);
  const slug = await ensureUniqueSlug(prisma.blog, baseSlug);
  const status = data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const blog = await prisma.blog.create({
    data: {
      title: data.title.trim(),
      slug,
      content: data.content,
      author: data.author.trim(),
      featuredImage: data.featuredImage || null,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ blog: toPlain(blog) }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { slugify, ensureUniqueSlug, toPlain } from "@/lib/utils";
import { validateBlog, hasErrors } from "@/lib/validation";

export async function GET(request, { params }) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id: Number(id) } });
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }
  return NextResponse.json({ blog: toPlain(blog) });
}

export async function PUT(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const blogId = Number(id);
  const data = await request.json();
  const errors = validateBlog(data);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const existing = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!existing) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  let slug = existing.slug;
  if (data.title.trim() !== existing.title) {
    slug = await ensureUniqueSlug(prisma.blog, slugify(data.title), blogId);
  }

  const status = data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const becomingPublished = status === "PUBLISHED" && existing.status !== "PUBLISHED";

  const blog = await prisma.blog.update({
    where: { id: blogId },
    data: {
      title: data.title.trim(),
      slug,
      content: data.content,
      author: data.author.trim(),
      featuredImage: data.featuredImage || null,
      status,
      publishedAt: becomingPublished ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json({ blog: toPlain(blog) });
}

export async function DELETE(request, { params }) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.blog.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}

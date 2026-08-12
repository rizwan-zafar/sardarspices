import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/utils";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id: Number(id) } });
  if (!blog) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/blogs" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to Blog Posts
        </Link>
        <h1 className="font-display text-2xl font-bold text-stone-800 mt-2">Edit Blog Post</h1>
      </div>
      <BlogForm blog={toPlain(blog)} />
    </div>
  );
}

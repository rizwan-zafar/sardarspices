import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain, formatDate } from "@/lib/utils";

async function getBlog(slug) {
  const blog = await prisma.blog.findUnique({ where: { slug } });
  if (!blog || blog.status !== "PUBLISHED") return null;
  return toPlain(blog);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Post Not Found | Sardar Spices" };
  return {
    title: `${blog.title} | Sardar Spices`,
    description: blog.content?.slice(0, 150),
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  return (
    <article className="container-app py-10 max-w-3xl">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blogs" className="hover:text-brand-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700 line-clamp-1">{blog.title}</span>
      </nav>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-3">
        {blog.title}
      </h1>
      <p className="text-sm text-stone-500 mb-8">
        By <span className="font-medium text-stone-700">{blog.author}</span> ·{" "}
        {formatDate(blog.publishedAt || blog.createdAt)}
      </p>

      {blog.featuredImage && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-brand-50 mb-8">
          <img src={blog.featuredImage} alt={blog.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed whitespace-pre-line">
        {blog.content}
      </div>

      <div className="mt-12 pt-6 border-t border-stone-200">
        <Link href="/blogs" className="text-brand-600 font-semibold hover:text-brand-700">
          ← Back to all posts
        </Link>
      </div>
    </article>
  );
}

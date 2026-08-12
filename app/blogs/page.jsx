import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain, formatDate } from "@/lib/utils";
import PageLinks from "@/components/common/PageLinks";
import EmptyState from "@/components/common/EmptyState";

export const metadata = {
  title: "Blog | Sardar Spices",
  description: "Recipes, tips, and stories from the world of spices.",
};

const PAGE_SIZE = 9;

export default async function BlogsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const where = { status: "PUBLISHED" };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.blog.count({ where }),
  ]);

  const plainBlogs = toPlain(blogs);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-800">Our Blog</h1>
        <p className="text-stone-500 mt-1">Recipes, tips, and stories from the world of spices</p>
      </div>

      {plainBlogs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plainBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden bg-brand-50">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">📰</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-stone-400 mb-1">
                    {formatDate(blog.publishedAt || blog.createdAt)} · {blog.author}
                  </p>
                  <h3 className="font-semibold text-lg text-stone-800 line-clamp-2 group-hover:text-brand-700 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-2 line-clamp-3">{blog.content}</p>
                </div>
              </Link>
            ))}
          </div>
          <PageLinks basePath="/blogs" searchParams={resolvedSearchParams} page={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState icon="📰" title="No blog posts yet" description="Check back soon for new articles." />
      )}
    </div>
  );
}

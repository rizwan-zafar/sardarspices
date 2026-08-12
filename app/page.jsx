import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain, formatDate } from "@/lib/utils";
import ProductGrid from "@/components/products/ProductGrid";
import CategoryCard from "@/components/categories/CategoryCard";
import Button from "@/components/common/Button";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featuredProducts, categories, blogs] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      include: { _count: { select: { products: true } } },
    }),
    prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return {
    featuredProducts: toPlain(featuredProducts),
    categories: toPlain(categories),
    blogs: toPlain(blogs),
  };
}

export default async function HomePage() {
  const { featuredProducts, categories, blogs } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="container-app relative py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-5">
              🌿 100% Authentic &amp; Farm Fresh
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              The True Taste of <span className="text-gold-400">Tradition</span>
            </h1>
            <p className="text-brand-100 text-lg max-w-xl mb-8">
              Premium spices, signature masala blends, and hand-picked dry fruits —
              delivered fresh to your door. Cash on Delivery, no account needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} href="/products" size="lg">
                Shop Now
              </Button>
              <Button as={Link} href="/categories" variant="outline" size="lg">
                Browse Categories
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="h-80 w-80 rounded-full bg-white/10 flex items-center justify-center text-[10rem] shadow-2xl">
              🌶️
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-800">
              Shop by Category
            </h2>
            <p className="text-stone-500 mt-1">Explore our range of authentic products</p>
          </div>
          <Link href="/categories" className="hidden sm:block text-brand-600 font-semibold hover:text-brand-700">
            View all →
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Categories coming soon.</p>
        )}
      </section>

      {/* Promo banner */}
      <section className="container-app pb-4">
        <div className="rounded-2xl bg-gold-500 px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-brand-900">
          <div>
            <h3 className="font-display text-2xl font-bold mb-1">Cash on Delivery, Nationwide</h3>
            <p className="text-brand-800/80">No online payment needed — pay when your order arrives.</p>
          </div>
          <Button as={Link} href="/products" variant="secondary" size="lg" className="whitespace-nowrap">
            Start Shopping →
          </Button>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-app py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-800">
              Featured Products
            </h2>
            <p className="text-stone-500 mt-1">Fresh picks, straight from our shelves</p>
          </div>
          <Link href="/products" className="hidden sm:block text-brand-600 font-semibold hover:text-brand-700">
            View all →
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Blog preview */}
      {blogs.length > 0 && (
        <section className="container-app py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-800">
                From Our Blog
              </h2>
              <p className="text-stone-500 mt-1">Tips, recipes, and spice stories</p>
            </div>
            <Link href="/blogs" className="hidden sm:block text-brand-600 font-semibold hover:text-brand-700">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
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
                  <p className="text-xs text-stone-400 mb-1">{formatDate(blog.publishedAt || blog.createdAt)}</p>
                  <h3 className="font-semibold text-stone-800 line-clamp-2 group-hover:text-brand-700 transition-colors">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-app pb-20">
        <div className="rounded-3xl bg-brand-900 text-white px-6 py-14 sm:px-14 text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Ready to spice up your kitchen?</h2>
          <p className="text-brand-200 max-w-xl mx-auto mb-8">
            Browse our full collection of premium spices, blends, and dry fruits — no signup required.
          </p>
          <Button as={Link} href="/products" size="lg">
            Explore All Products
          </Button>
        </div>
      </section>
    </div>
  );
}

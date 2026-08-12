import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/utils";
import ProductGrid from "@/components/products/ProductGrid";
import PageLinks from "@/components/common/PageLinks";

const PAGE_SIZE = 12;

async function getCategory(slug) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || category.status !== "ACTIVE") return null;
  return toPlain(category);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found | Sardar Spices" };
  return {
    title: `${category.name} | Sardar Spices`,
    description: category.description || `Shop ${category.name} at Sardar Spices.`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const where = { categoryId: category.id, status: "ACTIVE" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-app py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-brand-600">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{category.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="h-20 w-20 rounded-2xl object-cover flex-shrink-0"
          />
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-800">{category.name}</h1>
          {category.description && (
            <p className="text-stone-500 mt-1 max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>

      <ProductGrid products={toPlain(products)} />

      <PageLinks
        basePath={`/categories/${slug}`}
        searchParams={resolvedSearchParams}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}

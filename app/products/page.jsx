import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/utils";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import PageLinks from "@/components/common/PageLinks";

export const metadata = {
  title: "All Products | spicer",
  description: "Browse our full range of premium spices, blends, and dry fruits.",
};

const PAGE_SIZE = 12;

async function getData(searchParams) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const category = searchParams.category || undefined;
  const search = searchParams.search || undefined;
  const sort = searchParams.sort || "newest";

  const where = {
    status: "ACTIVE",
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? { name: { contains: search } } : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "name"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  return {
    products: toPlain(products),
    categories: toPlain(categories),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { products, categories, page, totalPages } = await getData(resolvedSearchParams);

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-800">All Products</h1>
        <p className="text-stone-500 mt-1">
          {resolvedSearchParams.category
            ? `Showing products in "${categories.find((c) => c.slug === resolvedSearchParams.category)?.name || resolvedSearchParams.category}"`
            : "Explore our full range of authentic spices and dry fruits"}
        </p>
      </div>

      <ProductFilters categories={categories} />
      <ProductGrid products={products} />

      <PageLinks
        basePath="/products"
        searchParams={resolvedSearchParams}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}

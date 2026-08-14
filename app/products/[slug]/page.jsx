import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain, formatCurrency } from "@/lib/utils";
import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductGrid from "@/components/products/ProductGrid";

async function getProduct(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product || product.status !== "ACTIVE") return null;
  return toPlain(product);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | spicer" };
  return {
    title: `${product.name} | spicer`,
    description: product.description?.slice(0, 150),
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: { select: { name: true, slug: true } } },
  });

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];

  return (
    <div className="container-app py-10">
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-brand-50 flex items-center justify-center">
          {images[0] ? (
            <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-8xl">🌶️</span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-700"
            >
              {product.category.name}
            </Link>
            <h1 className="font-display text-3xl font-bold text-stone-800 mt-1">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-brand-700">
              {formatCurrency(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">
                {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
              </span>
            ) : (
              <span className="rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
                Out of Stock
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-stone-600 leading-relaxed">{product.description}</p>
          )}

          <ProductDetailActions product={product} />

          <div className="border-t border-stone-200 pt-5 text-sm text-stone-500 space-y-1.5">
            <p>✅ Cash on Delivery available</p>
            <p>✅ Quality checked before dispatch</p>
            <p>✅ No account or login required to order</p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">
            You Might Also Like
          </h2>
          <ProductGrid products={toPlain(relatedProducts)} />
        </section>
      )}
    </div>
  );
}

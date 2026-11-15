import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/utils";
import { productDetailInclude, productListInclude } from "@/lib/product";
import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductGrid from "@/components/products/ProductGrid";
import { brandTitle } from "@/lib/brand";

async function getProduct(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
  if (!product || product.status !== "ACTIVE") return null;
  return toPlain(product);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: brandTitle("Product Not Found") };
  return {
    title: brandTitle(product.name),
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
    include: productListInclude,
  });

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const description = product.description ? String(product.description).trim() : "";
  const descriptionParagraphs = description ? description.split(/\n+/).filter(Boolean) : [];

  return (
    <div className="container-app py-4 sm:py-6 pb-12">
      <nav className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-stone-500 sm:text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <Link href="/products" className="hover:text-brand-700">
          Products
        </Link>
        {product.category?.slug && (
          <>
            <span className="text-stone-300">/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-700">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-8 xl:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <ProductImageGallery images={images} productName={product.name} />

        <div className="min-w-0 space-y-4">
          {product.category?.slug && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-brand-600 hover:text-brand-800"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-xl font-semibold leading-snug text-stone-900 sm:text-2xl">{product.name}</h1>

          <ProductDetailActions product={product} />

          {descriptionParagraphs.length > 0 && (
            <div className="border-t border-stone-200 pt-4">
              <h2 className="text-sm font-semibold text-stone-900">Details</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-600">
                {descriptionParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          <p className="flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-200 pt-3 text-xs text-stone-500">
            <span>💵 Cash on delivery</span>
            <span>·</span>
            <span>✓ Quality assured</span>
            <span>·</span>
            <span>📦 Nationwide delivery</span>
          </p>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-10 border-t border-stone-200 pt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-900">Related products</h2>
            <Link
              href={product.category?.slug ? `/categories/${product.category.slug}` : "/products"}
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View all
            </Link>
          </div>
          <ProductGrid products={toPlain(relatedProducts)} />
        </section>
      )}
    </div>
  );
}
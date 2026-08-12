import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPlain } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to Products
        </Link>
        <h1 className="font-display text-2xl font-bold text-stone-800 mt-2">Edit Product</h1>
      </div>
      <ProductForm product={toPlain(product)} />
    </div>
  );
}

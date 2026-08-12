import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to Products
        </Link>
        <h1 className="font-display text-2xl font-bold text-stone-800 mt-2">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}

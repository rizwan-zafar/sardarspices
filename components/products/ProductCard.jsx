"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const image = Array.isArray(product.images) && product.images[0];
  const outOfStock = product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product, 1);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-50">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">🌶️</div>
          )}
          {outOfStock && (
            <span className="absolute top-3 left-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              Only {product.stock} left
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-stone-800 line-clamp-2 hover:text-brand-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-brand-700">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
            aria-label="Add to cart"
            title={outOfStock ? "Out of stock" : "Add to cart"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

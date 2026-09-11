"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import { cheapestInStockVariant, salePrice } from "@/lib/product";
import PriceDisplay from "./PriceDisplay";
import SmartImage from "@/components/common/SmartImage";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const image = Array.isArray(product.images) && product.images[0];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const defaultVariant = cheapestInStockVariant(product);
  const outOfStock = !defaultVariant || Number(defaultVariant.stock) <= 0;
  const hasMultiple = variants.length > 1;
  const { onSale } = salePrice(defaultVariant);
  const lowStock = !outOfStock && Number(defaultVariant.stock) <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem(product, 1, defaultVariant);
    showToast(
      hasMultiple
        ? `${product.name} (${defaultVariant.name}) added to cart`
        : `${product.name} added to cart`
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-50">
          <SmartImage
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {outOfStock && (
            <span className="absolute top-3 left-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
          {!outOfStock && lowStock && (
            <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              Only {defaultVariant.stock} left
            </span>
          )}
          {onSale && !outOfStock && (
            <span className="absolute top-3 right-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
              Sale
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
        {hasMultiple && (
          <p className="text-xs text-stone-500">{variants.map((variant) => variant.name).join(" · ")}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <PriceDisplay variant={defaultVariant || product} prefix={hasMultiple ? "From" : ""} />
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
            aria-label="Add to cart"
            title={outOfStock ? "Out of stock" : hasMultiple ? "Add smallest pack to cart" : "Add to cart"}
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

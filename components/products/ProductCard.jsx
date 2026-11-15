"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import { cheapestInStockVariant, salePrice } from "@/lib/product";
import PriceDisplay from "./PriceDisplay";
import SmartImage from "@/components/common/SmartImage";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const image = Array.isArray(product.images) && product.images[0];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const defaultVariant = cheapestInStockVariant(product);
  const outOfStock = !defaultVariant || Number(defaultVariant.stock) <= 0;
  const hasMultiple = variants.length > 1;
  const { onSale } = salePrice(defaultVariant);
  const lowStock = !outOfStock && Number(defaultVariant.stock) <= 5;

  const addDefaultToCart = () => {
    addItem(product, 1, defaultVariant);
    showToast(
      hasMultiple
        ? `${product.name} (${defaultVariant.name}) added to cart`
        : `${product.name} added to cart`
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addDefaultToCart();
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addDefaultToCart();
    router.push("/checkout");
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white to-stone-100 sm:aspect-square">
          <SmartImage
            src={image}
            alt={product.name}
            framed
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            {outOfStock ? (
              <span className="rounded-md bg-stone-900/90 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="rounded-md bg-amber-600/95 px-2 py-1 text-[11px] font-medium text-white">
                {defaultVariant.stock} left
              </span>
            ) : (
              <span />
            )}
            {onSale && !outOfStock && (
              <span className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Sale
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col border-t border-stone-100 p-4">
        {product.category?.name && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-stone-900 transition-colors group-hover:text-brand-700 sm:text-[15px]">
            {product.name}
          </h3>
        </Link>
        {hasMultiple && (
          <p className="mt-1 line-clamp-1 text-xs text-stone-500">
            {variants.map((variant) => variant.name).join(" · ")}
          </p>
        )}

        <div className="mt-auto pt-4">
          <PriceDisplay
            variant={defaultVariant || product}
            prefix={hasMultiple ? "From" : ""}
            size="sm"
          />
          {outOfStock ? (
            <p className="mt-3 rounded-lg bg-stone-100 py-2.5 text-center text-sm font-medium text-stone-500">
              Unavailable
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-lg border border-stone-300 bg-white px-2 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:border-brand-500 hover:bg-brand-50 sm:text-sm"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-lg bg-brand-600 px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 sm:text-sm"
              >
                Buy now
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
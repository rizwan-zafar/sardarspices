"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import QuantitySelector from "./QuantitySelector";
import Button from "@/components/common/Button";
import { cheapestInStockVariant, salePrice } from "@/lib/product";
import PriceDisplay from "./PriceDisplay";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailActions({ product }) {
  const variants =
    Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [{ id: null, name: "Standard", price: product.price, stock: product.stock }];
  const defaultVariant = cheapestInStockVariant({ ...product, variants }) || variants[0];
  const [selectedId, setSelectedId] = useState(defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const selected = variants.find((variant) => variant.id === selectedId) || variants[0];
  const stock = Number(selected?.stock || 0);
  const outOfStock = stock <= 0;
  const allOutOfStock = variants.every((variant) => Number(variant.stock) <= 0);
  const { onSale, price } = salePrice(selected);

  const selectVariant = (variant) => {
    setSelectedId(variant.id);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selected);
    showToast(`${quantity} × ${product.name} (${selected.name}) added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selected);
    router.push("/checkout");
  };

  const stockLabel = allOutOfStock
    ? "Out of stock"
    : outOfStock
      ? "Pick another size"
      : stock > 10
        ? "In stock"
        : `${stock} left`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <PriceDisplay variant={selected} size="lg" />
        {onSale && (
          <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Sale</span>
        )}
        <span
          className={`text-xs font-medium ${
            allOutOfStock || outOfStock ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {stockLabel}
        </span>
      </div>

      {variants.length > 1 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-600">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((variant) => {
              const available = Number(variant.stock) > 0;
              const isSelected = variant.id === selected?.id;
              return (
                <button
                  key={variant.id || variant.name}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  disabled={!available}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : available
                        ? "border-stone-200 bg-white text-stone-800 hover:border-brand-400"
                        : "cursor-not-allowed border-stone-100 text-stone-400 line-through opacity-60"
                  }`}
                >
                  {variant.name}
                  {available && (
                    <span className={`ml-1 text-xs ${isSelected ? "text-brand-100" : "text-stone-500"}`}>
                      {formatCurrency(salePrice(variant).price)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!allOutOfStock && !outOfStock && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600">Qty</span>
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={stock} size="sm" />
          </div>
          <p className="text-sm text-stone-500 sm:ml-auto">
            Total{" "}
            <span className="font-semibold text-stone-900">{formatCurrency(price * quantity)}</span>
          </p>
        </div>
      )}

      {allOutOfStock ? (
        <p className="text-sm text-stone-600">Sold out — see related items below.</p>
      ) : outOfStock ? (
        <p className="text-sm text-amber-800">This size is unavailable.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleAddToCart} size="md" className="w-full !rounded-lg">
            Add to cart
          </Button>
          <Button onClick={handleBuyNow} size="md" className="w-full !rounded-lg !bg-stone-900 hover:!bg-stone-800">
            Buy now
          </Button>
        </div>
      )}
    </div>
  );
}
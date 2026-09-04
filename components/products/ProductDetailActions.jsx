"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import QuantitySelector from "./QuantitySelector";
import Button from "@/components/common/Button";
import { cheapestInStockVariant, salePrice } from "@/lib/product";
import PriceDisplay from "./PriceDisplay";

export default function ProductDetailActions({ product }) {
  const variants = Array.isArray(product.variants) && product.variants.length
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
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-stone-600 mb-2">Choose size</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const available = Number(variant.stock) > 0;
            const isSelected = variant.id === selected?.id;
            return (
              <button
                key={variant.id || variant.name}
                type="button"
                onClick={() => selectVariant(variant)}
                disabled={!available}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : available
                    ? "border-stone-300 bg-white text-stone-700 hover:border-brand-400"
                    : "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed"
                }`}
              >
                {variant.name}
                {!available ? " · Out of stock" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <PriceDisplay variant={selected} size="lg" />
        {salePrice(selected).onSale && (
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
            Sale
          </span>
        )}
        {allOutOfStock ? (
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
            Out of Stock
          </span>
        ) : outOfStock ? (
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
            Out of Stock
          </span>
        ) : (
          <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">
            {stock > 10 ? "In Stock" : `Only ${stock} left`}
          </span>
        )}
      </div>

      {allOutOfStock ? (
        <div className="rounded-xl bg-stone-100 px-4 py-3 text-stone-600 font-medium">
          This product is currently out of stock.
        </div>
      ) : outOfStock ? (
        <div className="rounded-xl bg-stone-100 px-4 py-3 text-stone-600 font-medium">
          This size is currently out of stock. Please choose another variation.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-stone-600">Quantity:</span>
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={stock} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAddToCart} size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} variant="secondary" size="lg" className="flex-1">
              Buy Now
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

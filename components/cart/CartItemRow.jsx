"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import QuantitySelector from "@/components/products/QuantitySelector";
import { formatCurrency } from "@/lib/utils";

export default function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-5 border-b border-stone-100 last:border-0">
      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-brand-50 flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl">🌶️</span>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} className="font-semibold text-stone-800 hover:text-brand-700 line-clamp-1">
          {item.name}
        </Link>
        <p className="text-sm text-stone-500 mt-0.5">{formatCurrency(item.price)} each</p>
        {item.quantity >= item.stock && (
          <p className="text-xs text-amber-600 mt-1">Max available stock reached</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          quantity={item.quantity}
          max={item.stock}
          onChange={(q) => updateQuantity(item.productId, q)}
          size="sm"
        />
        <button
          onClick={() => removeItem(item.productId)}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Remove
        </button>
      </div>

      <div className="hidden sm:block w-24 text-right font-semibold text-stone-800">
        {formatCurrency(item.price * item.quantity)}
      </div>
    </div>
  );
}

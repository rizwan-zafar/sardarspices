"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import QuantitySelector from "@/components/products/QuantitySelector";
import SmartImage from "@/components/common/SmartImage";
import { formatCurrency } from "@/lib/utils";

export default function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const lineTotal = item.price * item.quantity;

  return (
    <div className="border-b border-stone-100 py-5 last:border-0">
      <div className="flex gap-4 sm:grid sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center sm:gap-6">
        <Link
          href={`/products/${item.slug}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-50 sm:h-[5rem] sm:w-[5rem]"
        >
          <SmartImage src={item.image} alt={item.name} className="h-full w-full object-cover" fallback="🌶️" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-medium text-stone-900 hover:text-brand-700 sm:line-clamp-1"
          >
            {item.name}
          </Link>
          {item.variantName && (
            <p className="mt-0.5 text-xs text-stone-500">{item.variantName}</p>
          )}
          <p className="mt-1 text-xs text-stone-500">{formatCurrency(item.price)} each</p>
          {item.quantity >= item.stock && (
            <p className="mt-1 text-xs font-medium text-amber-700">Maximum stock in cart</p>
          )}
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="mt-2 text-xs font-medium text-stone-500 underline-offset-2 hover:text-red-600 hover:underline sm:hidden"
          >
            Remove
          </button>
        </div>

        <div className="flex flex-col items-end gap-2 sm:items-center">
          <QuantitySelector
            quantity={item.quantity}
            max={item.stock}
            onChange={(q) => updateQuantity(item.variantId, q)}
            size="sm"
          />
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="hidden text-xs font-medium text-stone-500 hover:text-red-600 sm:block"
          >
            Remove
          </button>
        </div>

        <p className="hidden text-right text-sm font-semibold text-stone-900 sm:block sm:w-24">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      <div className="mt-3 flex justify-between border-t border-dashed border-stone-100 pt-3 text-sm sm:hidden">
        <span className="text-stone-500">Line total</span>
        <span className="font-semibold text-stone-900">{formatCurrency(lineTotal)}</span>
      </div>
    </div>
  );
}
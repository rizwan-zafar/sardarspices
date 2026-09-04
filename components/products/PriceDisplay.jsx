import { formatCurrency } from "@/lib/utils";
import { salePrice } from "@/lib/product";

export default function PriceDisplay({ variant, prefix = "", size = "md" }) {
  const { price, compareAt, onSale } = salePrice(variant);
  const priceClass = size === "lg" ? "text-3xl font-bold text-brand-700" : "text-lg font-bold text-brand-700";
  const wasClass = size === "lg" ? "text-lg font-medium text-stone-400 line-through" : "text-sm font-medium text-stone-400 line-through";

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {prefix ? <span className="text-sm font-medium text-stone-500">{prefix}</span> : null}
      <span className={priceClass}>{formatCurrency(price)}</span>
      {onSale && <span className={wasClass}>{formatCurrency(compareAt)}</span>}
    </span>
  );
}

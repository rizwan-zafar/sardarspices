import Link from "next/link";
import Button from "@/components/common/Button";
import { formatCurrency } from "@/lib/utils";

export default function OrderSummaryPanel({
  subtotal,
  itemCount,
  ctaHref,
  ctaLabel,
  onCtaClick,
  ctaLoading,
  ctaType = "button",
  showDeliveryNote = true,
  showCta = true,
}) {
  return (
    <aside className="rounded-xl border border-stone-200/80 bg-white shadow-sm lg:sticky lg:top-24">
      <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-stone-900">Order summary</h2>
        {itemCount > 0 && (
          <p className="mt-0.5 text-sm text-stone-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        )}
      </div>
      <div className="space-y-3 px-5 py-4 sm:px-6 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span className="font-medium text-stone-800">{formatCurrency(subtotal)}</span>
        </div>
        {showDeliveryNote && (
          <div className="flex justify-between text-stone-600">
            <span>Delivery</span>
            <span className="font-medium text-emerald-700">Cash on delivery</span>
          </div>
        )}
      </div>
      <div className="border-t border-stone-100 px-5 py-4 sm:px-6">
        <div className="mb-5 flex justify-between text-base font-semibold text-stone-900">
          <span>Estimated total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {showCta &&
          (ctaHref ? (
            <Button as={Link} href={ctaHref} size="lg" className="w-full">
              {ctaLabel}
            </Button>
          ) : (
            <Button type={ctaType} size="lg" className="w-full" loading={ctaLoading} onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          ))}
        <p className={`text-center text-xs text-stone-500 ${showCta ? "mt-3" : ""}`}>
          Secure checkout · No account required
        </p>
      </div>
    </aside>
  );
}
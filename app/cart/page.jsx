"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummaryPanel from "@/components/cart/OrderSummaryPanel";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";

export default function CartPage() {
  const { items, subtotal, hydrated, clearCart, totalItems } = useCart();

  if (!hydrated) {
    return (
      <div className="container-app py-16">
        <Spinner label="Loading your cart..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-10 sm:py-14">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse our catalog and add spices or dry fruits to get started."
          action={
            <Button as={Link} href="/products">
              Shop products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-700">Shopping cart</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">Review your items</h1>
        <p className="mt-2 text-sm text-stone-600">
          {totalItems} {totalItems === 1 ? "item" : "items"} ready for checkout
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <section className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm">
          <div className="hidden border-b border-stone-100 bg-stone-50/80 px-6 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 sm:grid sm:grid-cols-[5rem_1fr_auto_auto] sm:gap-6">
            <span className="col-span-2">Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>
          <div className="px-5 sm:px-6">
            {items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/50 px-5 py-4 sm:px-6">
            <Button as={Link} href="/products" variant="secondary" size="sm">
              Continue shopping
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-medium text-stone-500 transition-colors hover:text-red-600"
            >
              Clear cart
            </button>
          </div>
        </section>

        <OrderSummaryPanel
          subtotal={subtotal}
          itemCount={totalItems}
          ctaHref="/checkout"
          ctaLabel="Proceed to checkout"
        />
      </div>
    </div>
  );
}
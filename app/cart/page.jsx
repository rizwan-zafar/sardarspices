"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, hydrated, clearCart } = useCart();

  if (!hydrated) {
    return (
      <div className="container-app py-16">
        <Spinner label="Loading your cart..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-10">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products and find something you love."
          action={
            <Button as={Link} href="/products">
              Browse Products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white px-5 sm:px-6">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
          <div className="py-4">
            <button
              onClick={clearCart}
              className="text-sm font-medium text-stone-500 hover:text-red-600"
            >
              Clear cart
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sticky top-24">
          <h2 className="font-semibold text-lg text-stone-800 mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600 mb-4">
            <span>Delivery</span>
            <span className="text-green-600 font-medium">Calculated at checkout</span>
          </div>
          <div className="border-t border-stone-200 pt-4 flex justify-between font-bold text-stone-800 text-lg mb-6">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Button as={Link} href="/checkout" size="lg" className="w-full">
            Proceed to Checkout
          </Button>
          <p className="text-xs text-stone-400 text-center mt-3">
            Cash on Delivery • No login required
          </p>
        </div>
      </div>
    </div>
  );
}

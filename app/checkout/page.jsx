"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ customerName: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        showToast(data.error || "Could not place your order.", "error");
        setSubmitting(false);
        return;
      }

      clearCart();
      showToast("Order placed successfully!");
      router.push(`/checkout/success?order=${data.order.orderNumber}`);
    } catch {
      showToast("Network error. Please try again.", "error");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="container-app py-16">
        <Spinner label="Loading checkout..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-10">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add some products to your cart before checking out."
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
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg text-stone-800">Delivery Details</h2>

          <Input
            label="Full Name"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="e.g. Ahmed Khan"
            error={errors.customerName}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 0300-1234567"
            error={errors.phone}
            required
          />
          <Textarea
            label="Complete Address"
            name="address"
            rows={4}
            value={form.address}
            onChange={handleChange}
            placeholder="House #, Street, Area, City"
            error={errors.address}
            required
          />

          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="font-semibold text-brand-800 text-sm">Cash on Delivery</p>
              <p className="text-xs text-brand-700">Pay in cash when your order is delivered.</p>
            </div>
          </div>

          <Button type="submit" size="lg" loading={submitting} className="w-full mt-2">
            Place Order — {formatCurrency(subtotal)}
          </Button>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sticky top-24">
          <h2 className="font-semibold text-lg text-stone-800 mb-4">Order Summary</h2>
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-brand-50 flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">🌶️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between font-bold text-stone-800 text-lg">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

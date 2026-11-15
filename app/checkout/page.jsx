"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/common/ToastContext";
import OrderSummaryPanel from "@/components/cart/OrderSummaryPanel";
import SmartImage from "@/components/common/SmartImage";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Spinner from "@/components/common/Spinner";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clearCart, totalItems } = useCart();
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
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
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
      <div className="container-app py-10 sm:py-14">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add products to your cart before completing checkout."
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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Checkout</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">Complete your order</h1>
          <p className="mt-2 text-sm text-stone-600">
            Name, phone, and address only — we will call to confirm delivery.
          </p>
        </div>
        <Link href="/cart" className="text-sm font-medium text-stone-600 hover:text-brand-700">
          ← Back to cart
        </Link>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm"
        >
          <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-stone-900">Delivery information</h2>
            <p className="mt-0.5 text-sm text-stone-500">We will use this to deliver your order.</p>
          </div>

          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6">
            <Input
              label="Full name"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Ahmed Khan"
              error={errors.customerName}
              required
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="0300 1234567"
              error={errors.phone}
              required
            />
            <Textarea
              label="Delivery address"
              name="address"
              rows={4}
              value={form.address}
              onChange={handleChange}
              placeholder="House number, street, area, city"
              error={errors.address}
              required
            />
          </div>

          <div className="border-t border-stone-100 bg-stone-50/60 px-5 py-5 sm:px-6">
            <h2 className="text-sm font-semibold text-stone-900">Payment method</h2>
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg">
                💵
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Cash on delivery</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                  Pay with cash when your order arrives. No online payment required.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 px-5 py-5 sm:px-6 lg:hidden">
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Place order · {formatCurrency(subtotal)}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <h2 className="text-base font-semibold text-stone-900">Items in order</h2>
            </div>
            <ul className="max-h-64 divide-y divide-stone-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
                    <SmartImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-stone-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {item.variantName ? `${item.variantName} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-stone-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <OrderSummaryPanel
            subtotal={subtotal}
            itemCount={totalItems}
            showCta={false}
          />

          <div className="hidden lg:block">
            <Button type="submit" form="checkout-form" size="lg" className="w-full" loading={submitting}>
              Place order · {formatCurrency(subtotal)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
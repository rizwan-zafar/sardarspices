import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPlain, formatCurrency, formatDateTime } from "@/lib/utils";
import Button from "@/components/common/Button";

export const metadata = { title: "Order Confirmed | spicer" };

export default async function CheckoutSuccessPage({ searchParams }) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const plainOrder = toPlain(order);

  return (
    <div className="container-app py-16 max-w-2xl">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✅
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-2">Order Placed!</h1>
        <p className="text-stone-500">
          Thank you, {plainOrder.customerName}. Your order has been received and will be delivered soon.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-stone-100">
          <div>
            <p className="text-xs text-stone-400">Order Number</p>
            <p className="font-bold text-brand-700 text-lg">{plainOrder.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">Placed On</p>
            <p className="text-sm font-medium text-stone-700">{formatDateTime(plainOrder.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {plainOrder.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-stone-700">
                {item.productName} <span className="text-stone-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-stone-800">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-800 text-lg mb-5">
          <span>Total</span>
          <span>{formatCurrency(plainOrder.totalAmount)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400 text-xs mb-1">Delivery Address</p>
            <p className="text-stone-700">{plainOrder.address}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs mb-1">Phone</p>
            <p className="text-stone-700">{plainOrder.phone}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 flex items-center gap-3">
          <span className="text-xl">💵</span>
          <p className="text-sm text-brand-800 font-medium">
            Payment Method: Cash on Delivery
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button as={Link} href="/products" variant="secondary">
          Continue Shopping
        </Button>
        <Button as={Link} href="/">
          Back to Home
        </Button>
      </div>
    </div>
  );
}

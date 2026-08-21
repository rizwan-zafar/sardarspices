"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Select from "@/components/common/Select";
import Spinner from "@/components/common/Spinner";
import ErrorState from "@/components/common/ErrorState";
import { useToast } from "@/components/common/ToastContext";
import { formatCurrency, formatDateTime, orderStatusColor, ORDER_STATUSES } from "@/lib/utils";

export default function AdminOrderDetailPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  const loadOrder = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not update status", "error");
        return;
      }
      setOrder(data.order);
      showToast("Order status updated");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner />;
  if (error || !order) return <ErrorState title="Order not found" onRetry={loadOrder} />;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-brand-600 hover:text-brand-700">
        ← Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">{order.orderNumber}</h1>
          <p className="text-stone-500">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <a
            href={`/api/orders/${order.id}/receipt`}
            className="inline-flex items-center rounded-full bg-white border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Download Receipt
          </a>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${orderStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Order Items</h2>
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-stone-800">{item.productName}</p>
                    <p className="text-sm text-stone-500">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-stone-800">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between font-bold text-lg text-stone-800">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Customer Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-400 text-xs">Name</dt>
                <dd className="text-stone-700 font-medium">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Email</dt>
                <dd className="text-stone-700 font-medium">{order.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Phone</dt>
                <dd className="text-stone-700 font-medium">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Address</dt>
                <dd className="text-stone-700">{order.address}</dd>
              </div>
              <div>
                <dt className="text-stone-400 text-xs">Payment Method</dt>
                <dd className="text-stone-700 font-medium">{order.paymentMethod}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-white border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Update Status</h2>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating || order.status === "CANCELLED"}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            {order.status === "CANCELLED" && (
              <p className="text-xs text-stone-400 mt-2">Cancelled orders cannot be changed further.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

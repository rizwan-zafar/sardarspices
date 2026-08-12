"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Table from "@/components/common/Table";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/common/ToastContext";
import { formatCurrency, formatDateTime, orderStatusColor, ORDER_STATUSES } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Orders</h1>
        <p className="text-stone-500">Manage and track customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by order #, name, or phone..."
          className="w-full sm:max-w-xs rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="ALL">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState icon="🧾" title="No orders found" description="Orders will appear here once customers start shopping." />
      ) : (
        <>
          <Table columns={["Order #", "Customer", "Phone", "Items", "Total", "Status", "Date", ""]}>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-stone-800">{order.orderNumber}</td>
                <td className="px-4 py-3 text-stone-700">{order.customerName}</td>
                <td className="px-4 py-3 text-stone-600">{order.phone}</td>
                <td className="px-4 py-3 text-stone-600">{order.items?.length ?? 0}</td>
                <td className="px-4 py-3 text-stone-700 font-medium">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

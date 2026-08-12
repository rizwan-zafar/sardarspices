import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPlain, formatCurrency, formatDateTime, orderStatusColor } from "@/lib/utils";
import StatCard from "@/components/admin/StatCard";
import EmptyState from "@/components/common/EmptyState";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalProducts, totalCategories, totalOrders, pendingOrders, salesResult, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalSales: salesResult._sum.totalAmount ? Number(salesResult._sum.totalAmount) : 0,
    recentOrders: toPlain(recentOrders),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-800 mb-1">Dashboard</h1>
      <p className="text-stone-500 mb-8">Welcome back! Here&apos;s what&apos;s happening in your store.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard icon="🌶️" label="Total Products" value={stats.totalProducts} accent="bg-brand-500" />
        <StatCard icon="🗂️" label="Categories" value={stats.totalCategories} accent="bg-amber-500" />
        <StatCard icon="🧾" label="Total Orders" value={stats.totalOrders} accent="bg-indigo-500" />
        <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} accent="bg-red-500" />
        <StatCard icon="💰" label="Total Sales" value={formatCurrency(stats.totalSales)} accent="bg-green-600" />
      </div>

      <div className="rounded-2xl bg-white border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <EmptyState icon="🧾" title="No orders yet" description="Orders will appear here once customers start shopping." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs uppercase text-stone-400 border-b border-stone-100">
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-700">{order.customerName}</td>
                    <td className="px-5 py-3 text-stone-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

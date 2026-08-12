"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/components/common/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ all: "true", page: String(page), pageSize: "10" });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category]);

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not delete product", "error");
        return;
      }
      showToast(data.message || "Product deleted");
      loadProducts();
    } catch {
      showToast("Network error. Please try again.", "error");
    }
  };

  const toggleStatus = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          images: product.images,
          status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Product status updated");
      loadProducts();
    } catch {
      showToast("Could not update status", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Products</h1>
          <p className="text-stone-500">Manage your product catalog</p>
        </div>
        <Button as={Link} href="/admin/products/new">+ Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search products..."
          className="w-full sm:max-w-xs rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState icon="🌶️" title="No products found" description="Try adjusting your search or add a new product." action={<Button as={Link} href="/admin/products/new">+ Add Product</Button>} />
      ) : (
        <>
          <Table columns={["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"]}>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl">🌶️</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-stone-800 max-w-xs">
                  <span className="line-clamp-1">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-stone-600">{product.category?.name}</td>
                <td className="px-4 py-3 text-stone-700">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 5 ? "text-red-600 font-semibold" : "text-stone-700"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(product)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      product.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }`}
                  >
                    {product.status}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product)} className="text-sm font-medium text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
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

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [, startTransition] = useTransition();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", search.trim());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
      <form onSubmit={handleSearchSubmit} className="flex w-full sm:max-w-xs">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-l-full border border-stone-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
        />
        <button
          type="submit"
          className="rounded-r-full bg-brand-500 px-4 text-white hover:bg-brand-600 transition-colors"
          aria-label="Search"
        >
          🔍
        </button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={searchParams.get("category") || ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-full border border-stone-300 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-full border border-stone-300 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>
    </div>
  );
}

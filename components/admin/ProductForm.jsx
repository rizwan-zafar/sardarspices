"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/common/ToastContext";

export default function ProductForm({ product }) {
  const isEditing = Boolean(product);
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    status: product?.status || "ACTIVE",
    image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => showToast("Failed to load categories", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      categoryId: form.categoryId,
      status: form.status,
      images: form.image ? [form.image] : [],
    };

    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        showToast(data.error || "Something went wrong", "error");
        setSaving(false);
        return;
      }

      showToast(isEditing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-6 flex flex-col gap-5 max-w-2xl">
      <Input label="Product Name" value={form.name} onChange={handleChange("name")} error={errors.name} required />
      <Textarea label="Description" rows={4} value={form.description} onChange={handleChange("description")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Price (Rs.)"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={handleChange("price")}
          error={errors.price}
          required
        />
        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={handleChange("stock")}
          error={errors.stock}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select label="Category" value={form.categoryId} onChange={handleChange("categoryId")} error={errors.categoryId} required>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
        <Select label="Status" value={form.status} onChange={handleChange("status")}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <ImageUploader label="Product Image" value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />

      <div className="flex justify-end gap-3 pt-2 border-t border-stone-100 mt-2">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

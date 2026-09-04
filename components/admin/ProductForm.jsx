"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/common/ToastContext";

function emptyVariant() {
  return { name: "", price: "", compareAtPrice: "", stock: "" };
}

function initialVariants(product) {
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name || "",
      price: variant.price ?? "",
      compareAtPrice: variant.compareAtPrice ?? "",
      stock: variant.stock ?? "",
    }));
  }
  if (product) {
    return [{ name: "Standard", price: product.price ?? "", compareAtPrice: "", stock: product.stock ?? "" }];
  }
  return [emptyVariant()];
}

export default function ProductForm({ product }) {
  const isEditing = Boolean(product);
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    status: product?.status || "ACTIVE",
    image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : "",
    variants: initialVariants(product),
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

  const handleVariantChange = (index, key) => (e) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: e.target.value } : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.length === 1 ? f.variants : f.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      status: form.status,
      images: form.image ? [form.image] : [],
      variants: form.variants,
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-stone-700">Variations</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Pack sizes or piece counts, each with its own price and stock. Add an original price to show a discount.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={addVariant}>
            + Add variation
          </Button>
        </div>
        {errors.variants && <p className="text-sm text-red-600 mb-2">{errors.variants}</p>}
        <div className="flex flex-col gap-3">
          {form.variants.map((variant, index) => (
            <div key={variant.id || `new-${index}`} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <Input
                    label="Size / pack"
                    value={variant.name}
                    onChange={handleVariantChange(index, "name")}
                    placeholder="e.g. 100g or 10 pieces"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <Input
                    label="Stock"
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={handleVariantChange(index, "stock")}
                    error={errors[`variants.${index}.stock`]}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={form.variants.length === 1}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
                <div className="sm:col-span-6">
                  <Input
                    label="Original price (Rs.)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.compareAtPrice}
                    onChange={handleVariantChange(index, "compareAtPrice")}
                    error={errors[`variants.${index}.compareAtPrice`]}
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-6">
                  <Input
                    label="Selling price (Rs.)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={handleVariantChange(index, "price")}
                    error={errors[`variants.${index}.price`]}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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

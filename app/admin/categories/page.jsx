"use client";

import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/Table";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/common/ToastContext";
import { formatDate } from "@/lib/utils";

const emptyForm = { name: "", description: "", image: "", status: "ACTIVE" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      status: category.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        showToast(data.error || "Something went wrong", "error");
        return;
      }

      showToast(editing ? "Category updated" : "Category created");
      setModalOpen(false);
      loadCategories();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not delete category", "error");
        return;
      }
      showToast("Category deleted");
      loadCategories();
    } catch {
      showToast("Network error. Please try again.", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Categories</h1>
          <p className="text-stone-500">Manage your product categories</p>
        </div>
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState icon="🗂️" title="No categories yet" description="Create your first category to get started." action={<Button onClick={openCreate}>+ Add Category</Button>} />
      ) : (
        <Table columns={["Image", "Name", "Products", "Status", "Created", "Actions"]}>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="px-4 py-3">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">🧂</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-stone-800">{cat.name}</p>
                <p className="text-xs text-stone-500 line-clamp-1 max-w-xs">{cat.description}</p>
              </td>
              <td className="px-4 py-3 text-stone-600">{cat._count?.products ?? 0}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    cat.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {cat.status}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-500">{formatDate(cat.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat)} className="text-sm font-medium text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            required
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <ImageUploader
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

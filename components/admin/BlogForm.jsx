"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/common/ToastContext";

export default function BlogForm({ blog }) {
  const isEditing = Boolean(blog);
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: blog?.title || "",
    author: blog?.author || "Sardar Spices Team",
    content: blog?.content || "",
    featuredImage: blog?.featuredImage || "",
    status: blog?.status || "DRAFT",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const url = isEditing ? `/api/blogs/${blog.id}` : "/api/blogs";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        showToast(data.error || "Something went wrong", "error");
        setSaving(false);
        return;
      }

      showToast(isEditing ? "Blog post updated" : "Blog post created");
      router.push("/admin/blogs");
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-6 flex flex-col gap-5 max-w-2xl">
      <Input label="Title" value={form.title} onChange={handleChange("title")} error={errors.title} required />
      <Input label="Author" value={form.author} onChange={handleChange("author")} error={errors.author} required />
      <ImageUploader label="Featured Image" value={form.featuredImage} onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))} />
      <Textarea label="Content" rows={10} value={form.content} onChange={handleChange("content")} error={errors.content} required />
      <Select label="Status" value={form.status} onChange={handleChange("status")}>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
      </Select>

      <div className="flex justify-end gap-3 pt-2 border-t border-stone-100 mt-2">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/blogs")}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {isEditing ? "Save Changes" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}

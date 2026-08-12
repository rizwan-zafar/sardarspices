"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import { useToast } from "@/components/common/ToastContext";
import { formatDate } from "@/lib/utils";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs?all=true&pageSize=50");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      showToast("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePublish = async (blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          author: blog.author,
          content: blog.content,
          featuredImage: blog.featuredImage,
          status: blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        }),
      });
      if (!res.ok) throw new Error();
      showToast(blog.status === "PUBLISHED" ? "Post unpublished" : "Post published");
      loadBlogs();
    } catch {
      showToast("Could not update post", "error");
    }
  };

  const handleDelete = async (blog) => {
    if (!confirm(`Delete "${blog.title}"?`)) return;
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Blog post deleted");
      loadBlogs();
    } catch {
      showToast("Could not delete post", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Blog Posts</h1>
          <p className="text-stone-500">Manage your blog content</p>
        </div>
        <Button as={Link} href="/admin/blogs/new">+ Add Post</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : blogs.length === 0 ? (
        <EmptyState icon="📰" title="No blog posts yet" description="Write your first post to engage your customers." action={<Button as={Link} href="/admin/blogs/new">+ Add Post</Button>} />
      ) : (
        <Table columns={["Title", "Author", "Status", "Date", "Actions"]}>
          {blogs.map((blog) => (
            <tr key={blog.id}>
              <td className="px-4 py-3 font-medium text-stone-800 max-w-sm">
                <span className="line-clamp-1">{blog.title}</span>
              </td>
              <td className="px-4 py-3 text-stone-600">{blog.author}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => togglePublish(blog)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    blog.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {blog.status}
                </button>
              </td>
              <td className="px-4 py-3 text-stone-500">{formatDate(blog.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(blog)} className="text-sm font-medium text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

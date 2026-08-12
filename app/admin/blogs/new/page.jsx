import Link from "next/link";
import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/blogs" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to Blog Posts
        </Link>
        <h1 className="font-display text-2xl font-bold text-stone-800 mt-2">Add Blog Post</h1>
      </div>
      <BlogForm />
    </div>
  );
}

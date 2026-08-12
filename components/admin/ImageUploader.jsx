"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/common/ToastContext";

export default function ImageUploader({ value, onChange, label = "Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Upload failed", "error");
        return;
      }
      onChange(data.url);
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl text-stone-300">🖼️</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-500 hover:text-red-700 text-left"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

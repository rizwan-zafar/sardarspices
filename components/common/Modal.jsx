"use client";

import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-stone-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

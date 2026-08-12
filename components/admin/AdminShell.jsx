"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-stone-100">
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-screen">
          <AdminSidebar admin={admin} className="h-full" />
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64">
            <AdminSidebar admin={admin} className="h-full" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌶️</span>
            <span className="font-display font-bold text-brand-800">Sardar Spices Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

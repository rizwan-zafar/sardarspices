import Link from "next/link";

// Server-renderable pagination built from plain links (no client JS needed).
export default function PageLinks({ basePath, searchParams, page, totalPages }) {
  if (totalPages <= 1) return null;

  const hrefFor = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  let lastRendered = 0;

  return (
    <div className="flex items-center justify-center gap-1 py-8 flex-wrap">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          page === 1 ? "pointer-events-none text-stone-300" : "text-stone-600 hover:bg-brand-50"
        }`}
      >
        ← Prev
      </Link>
      {pages.map((p) => {
        const showEllipsis = p - lastRendered > 1;
        lastRendered = p;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && <span className="px-1 text-stone-400">…</span>}
            <Link
              href={hrefFor(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                p === page ? "bg-brand-500 text-white" : "text-stone-600 hover:bg-brand-50"
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          page === totalPages ? "pointer-events-none text-stone-300" : "text-stone-600 hover:bg-brand-50"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}

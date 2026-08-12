export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  let lastRendered = 0;

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        ← Prev
      </button>
      {pages.map((p) => {
        const showEllipsis = p - lastRendered > 1;
        lastRendered = p;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && <span className="px-1 text-stone-400">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                p === page
                  ? "bg-brand-500 text-white"
                  : "text-stone-600 hover:bg-brand-50"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Next →
      </button>
    </div>
  );
}

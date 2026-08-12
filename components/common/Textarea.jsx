export default function Textarea({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
          error ? "border-red-400" : "border-stone-300"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

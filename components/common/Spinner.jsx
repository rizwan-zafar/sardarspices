export default function Spinner({ className = "h-8 w-8", label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-stone-500">
      <span
        className={`${className} rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin`}
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

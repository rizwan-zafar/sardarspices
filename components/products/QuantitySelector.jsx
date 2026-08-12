export default function QuantitySelector({ quantity, onChange, max = 99, min = 1, size = "md" }) {
  const dec = () => onChange(Math.max(min, quantity - 1));
  const inc = () => onChange(Math.min(max, quantity + 1));
  const btnSize = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10";

  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 overflow-hidden">
      <button
        type="button"
        onClick={dec}
        disabled={quantity <= min}
        className={`flex items-center justify-center ${btnSize} text-stone-600 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold text-stone-800">
        {quantity}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={quantity >= max}
        className={`flex items-center justify-center ${btnSize} text-stone-600 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

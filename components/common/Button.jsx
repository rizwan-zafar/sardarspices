const VARIANTS = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500",
  secondary:
    "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus-visible:outline-brand-500",
  outline:
    "bg-transparent text-white border border-white/70 hover:bg-white/10 focus-visible:outline-white",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  const isNativeButton = Component === "button";

  return (
    <Component
      {...(isNativeButton ? { disabled: disabled || loading } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        !isNativeButton && (disabled || loading) ? "opacity-60 pointer-events-none" : ""
      } disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </Component>
  );
}

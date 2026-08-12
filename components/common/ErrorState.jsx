import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-4">
      <div className="text-5xl">⚠️</div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      <p className="text-sm text-stone-500 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

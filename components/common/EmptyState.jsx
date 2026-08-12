export default function EmptyState({ icon = "🌶️", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-4">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      {description && <p className="text-sm text-stone-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

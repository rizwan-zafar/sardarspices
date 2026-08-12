export default function StatCard({ icon, label, value, accent = "bg-brand-500" }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
        <p className="text-sm text-stone-500">{label}</p>
      </div>
    </div>
  );
}

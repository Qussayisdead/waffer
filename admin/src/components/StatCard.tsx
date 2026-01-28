export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl border border-white/60 p-6">
      <div className="text-sm text-dusk/70">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

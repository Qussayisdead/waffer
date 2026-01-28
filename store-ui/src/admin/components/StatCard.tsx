export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
      <div className="text-sm text-night/60">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-night">{value}</div>
    </div>
  );
}

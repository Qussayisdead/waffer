type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="text-night/70">{label}</span>
      <input
        className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
        {...props}
      />
    </label>
  );
}

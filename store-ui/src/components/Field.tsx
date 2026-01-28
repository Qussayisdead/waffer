type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, ...props }: FieldProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="text-night/70">{label}</span>
      <input
        className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-lg text-night outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
        {...props}
      />
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="text-dusk/80">{label}</span>
      <input
        className="w-full rounded-xl border border-dusk/20 bg-white/80 px-4 py-3 text-ink outline-none focus:border-clay/60"
        {...props}
      />
    </label>
  );
}

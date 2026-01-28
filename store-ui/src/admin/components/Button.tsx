type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  const base =
    "rounded-2xl px-5 py-2 text-sm font-semibold tracking-tight shadow-sm transition active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-night text-white hover:bg-emerald-700"
      : "border border-night/15 bg-white/70 text-night hover:border-emerald-300 hover:text-emerald-700";

  return <button className={`${base} ${styles}`} {...props} />;
}

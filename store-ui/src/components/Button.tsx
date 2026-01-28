type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "rounded-2xl px-6 py-3 text-base font-semibold tracking-tight shadow-sm transition active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-night text-white hover:bg-night/90"
      : "border border-night/20 text-night hover:border-night/40 bg-white/70";

  return <button className={`${base} ${styles} ${className || ""}`} {...props} />;
}

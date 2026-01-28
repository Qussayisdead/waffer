type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  const base = "rounded-xl px-5 py-2 text-sm transition";
  const styles =
    variant === "primary"
      ? "bg-dusk text-white hover:bg-dusk/90"
      : "border border-dusk/20 text-dusk hover:border-dusk/40";

  return <button className={`${base} ${styles}`} {...props} />;
}

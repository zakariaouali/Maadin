import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold hover:bg-gold-deep text-ink font-medium transition-colors disabled:opacity-50",
  secondary:
    "border border-stone/30 bg-white hover:bg-sand text-ink font-medium transition-colors disabled:opacity-50",
  danger:
    "bg-henna hover:bg-henna/80 text-white font-medium transition-colors disabled:opacity-50",
  ghost:
    "text-gold-deep hover:text-ink hover:bg-sand transition-colors disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-sm",
  md: "px-4 py-2.5 text-sm rounded-sm",
  lg: "px-6 py-3 text-base rounded-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

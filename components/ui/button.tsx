import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "default" | "sm" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-white shadow-warm hover:bg-action-hover",
  secondary: "bg-brand text-white shadow-warm hover:bg-brand-strong",
  outline: "border border-brand/25 bg-white text-brand hover:bg-mint/55",
  ghost: "bg-transparent text-ink hover:bg-border/35",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-11 px-6 py-2.5",
  sm: "min-h-11 px-4 py-2 text-sm",
  icon: "size-11 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-highlight/70 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

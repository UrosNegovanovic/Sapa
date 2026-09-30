import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
};

export function Input({
  id,
  label,
  description,
  error,
  className,
  ...props
}: InputProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-ink text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "rounded-input border-border text-ink placeholder:text-coffee/65 focus:border-brand focus:ring-mint min-h-12 w-full border bg-white px-4 outline-none focus:ring-3",
          error && "border-action focus:border-action focus:ring-peach",
          className,
        )}
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="text-coffee text-sm">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-action text-sm font-semibold"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

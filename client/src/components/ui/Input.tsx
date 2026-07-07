import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-ink
          placeholder:text-ink-muted transition-colors duration-150
          focus:outline-2 focus:outline-offset-1 focus:outline-accent
          ${error ? "border-danger" : "border-line"} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

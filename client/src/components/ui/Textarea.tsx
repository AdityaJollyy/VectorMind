import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full resize-none rounded-lg border border-line bg-surface px-3.5 py-2
        text-sm text-ink placeholder:text-ink-muted transition-colors duration-150
        focus:outline-2 focus:outline-offset-1 focus:outline-accent ${className}`}
      {...props}
    />
  );
}

export function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span
      className={`font-display font-semibold tracking-tight text-ink ${className}`}
    >
      Margin
      <span className="relative inline-block px-0.5">
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0.5 top-1/3 -skew-x-6 bg-highlight/80"
        />
        <span className="relative">alia</span>
      </span>
    </span>
  );
}

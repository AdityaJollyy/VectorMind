export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`type-display select-none text-ink ${className}`}>
      VectorMind<span className="text-accent">.</span>
    </span>
  );
}

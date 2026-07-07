import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/auth.store";

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-6 py-3">
        <Wordmark className="text-xl" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-muted">
            {user?.email}
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-ink-muted">
          The workspace arrives in the next step.
        </p>
      </main>
    </div>
  );
}

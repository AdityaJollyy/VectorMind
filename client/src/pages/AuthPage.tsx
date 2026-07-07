import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthPage() {
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <h1 className="font-display text-xl font-semibold text-ink">
            Welcome
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Auth form arrives in the next step. The theme shell is live.
          </p>
        </div>
      </main>
    </div>
  );
}

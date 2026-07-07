import { LogOut } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 sm:px-6">
      <Wordmark className="text-lg" />
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-xs text-ink-muted sm:inline">
          {user?.email}
        </span>
        <ThemeToggle />
        <button
          onClick={() => logout.mutate()}
          aria-label="Log out"
          className="rounded-lg border border-line bg-surface p-2 text-ink-muted
            transition-colors duration-150 hover:text-danger"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme.store";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className="themed rounded-lg border border-line bg-surface p-2 text-ink-muted
        transition-colors duration-150 hover:text-ink"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}

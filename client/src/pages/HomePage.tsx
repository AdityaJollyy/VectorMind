import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ContentPanel } from "@/components/content/ContentPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useSources } from "@/hooks/useSources";

type MobileTab = "sources" | "overview" | "chat";
const tabLabels: Record<MobileTab, string> = {
  sources: "Sources",
  overview: "Document",
  chat: "Chat",
};
const tabs: MobileTab[] = ["sources", "overview", "chat"];

const CHAT_MIN = 320;
const CHAT_MAX = 680;
const CHAT_DEFAULT = 420;
const CHAT_WIDTH_KEY = "vm-chat-width";

function initialChatWidth(): number {
  const saved = Number(localStorage.getItem(CHAT_WIDTH_KEY));
  return saved >= CHAT_MIN && saved <= CHAT_MAX ? saved : CHAT_DEFAULT;
}

export function HomePage() {
  const { data: sources } = useSources();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<MobileTab>("sources");
  const mainRef = useRef<HTMLElement>(null);

  // Derive the effective selection (user's pick, else first source) — no effect.
  const effectiveSelectedId = selectedId ?? sources?.[0]?.id ?? null;
  const selected = sources?.find((s) => s.id === effectiveSelectedId) ?? null;

  function onSelect(id: string | null) {
    setSelectedId(id);
    if (id) setTab("chat");
  }

  /**
   * Drag-to-resize the chat pane. Writes a CSS variable directly to the DOM on
   * each move (no React re-renders → buttery smooth) and persists on release.
   */
  function onResizeStart(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const main = mainRef.current;
    if (!main) return;

    const startX = e.clientX;
    const startWidth =
      Number(
        getComputedStyle(main).getPropertyValue("--chat-w").replace("px", "")
      ) || CHAT_DEFAULT;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    let width = startWidth;
    const onMove = (ev: globalThis.PointerEvent) => {
      width = Math.min(
        CHAT_MAX,
        Math.max(CHAT_MIN, startWidth + (startX - ev.clientX))
      );
      main.style.setProperty("--chat-w", `${width}px`);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(CHAT_WIDTH_KEY, String(Math.round(width)));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizeReset() {
    mainRef.current?.style.setProperty("--chat-w", `${CHAT_DEFAULT}px`);
    localStorage.setItem(CHAT_WIDTH_KEY, String(CHAT_DEFAULT));
  }

  const paneVisibility = (pane: MobileTab) =>
    tab === pane ? "flex" : "hidden";

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <AppHeader />

      {/* Mobile pane switcher */}
      <div className="flex border-b border-line lg:hidden">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors duration-150
              ${tab === t ? "bg-accent text-on-accent" : "text-ink-muted"}`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <main
        ref={mainRef}
        style={{ ["--chat-w" as string]: `${initialChatWidth()}px` }}
        className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)_auto_var(--chat-w)]"
      >
        <div
          className={`${paneVisibility("sources")} min-h-0 flex-col border-line lg:flex lg:border-r`}
        >
          <SourcesPanel selectedId={effectiveSelectedId} onSelect={onSelect} />
        </div>

        <div
          className={`${paneVisibility("overview")} min-h-0 flex-col lg:flex`}
        >
          <ContentPanel source={selected} />
        </div>

        {/* Drag handle (desktop only) */}
        <div
          onPointerDown={onResizeStart}
          onDoubleClick={onResizeReset}
          title="Drag to resize · double-click to reset"
          className="group hidden w-2 cursor-col-resize items-center justify-center lg:flex"
        >
          <div className="h-10 w-0.5 bg-line transition-colors duration-150 group-hover:bg-accent" />
        </div>

        <div
          className={`${paneVisibility("chat")} min-h-0 flex-col border-line bg-surface lg:flex lg:border-l`}
        >
          <ChatPanel source={selected} />
        </div>
      </main>
    </div>
  );
}

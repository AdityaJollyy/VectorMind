import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ContentPanel } from "@/components/content/ContentPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useSources } from "@/hooks/useSources";

type MobileTab = "sources" | "overview" | "chat";
const tabs: MobileTab[] = ["sources", "overview", "chat"];

export function HomePage() {
  const { data: sources } = useSources();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<MobileTab>("sources");

  // Derive the effective selection: the user's explicit pick, or fall back to
  // the first source. No effect + setState, so no cascading renders.
  const effectiveSelectedId = selectedId ?? sources?.[0]?.id ?? null;
  const selected = sources?.find((s) => s.id === effectiveSelectedId) ?? null;

  function onSelect(id: string | null) {
    setSelectedId(id);
    if (id) setTab("chat");
  }

  const paneVisibility = (pane: MobileTab) =>
    tab === pane ? "flex" : "hidden";

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <AppHeader />

      {/* Mobile pane switcher */}
      <div className="flex gap-1 border-b border-line bg-surface p-2 lg:hidden">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize
              transition-colors duration-150
              ${tab === t ? "bg-accent-soft text-accent" : "text-ink-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)_420px]">
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
        <div
          className={`${paneVisibility("chat")} min-h-0 flex-col border-line bg-surface lg:flex lg:border-l`}
        >
          <ChatPanel source={selected} />
        </div>
      </main>
    </div>
  );
}

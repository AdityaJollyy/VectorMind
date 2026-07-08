import { FileText, Globe, Table2, Trash2, Type } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import type { Source } from "@/lib/types";

const typeIcons = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  csv: Table2,
  text: Type,
  url: Globe,
} as const;

const typeLabels: Record<Source["type"], string> = {
  pdf: "PDF",
  docx: "Word",
  csv: "CSV",
  txt: "Text file",
  text: "Text",
  url: "Web page",
};

interface SourceItemProps {
  source: Source;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SourceItem({
  source,
  selected,
  onSelect,
  onDelete,
}: SourceItemProps) {
  const Icon = typeIcons[source.type];
  const name =
    source.title ?? source.originalName ?? source.sourceUrl ?? "Untitled";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`group relative flex cursor-pointer items-start gap-2.5 rounded-lg p-3
        transition-colors duration-150
        ${selected ? "bg-surface-2" : "hover:bg-surface-2/60"}`}
    >
      {selected && (
        <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />
      )}

      <Icon
        className={`mt-0.5 size-4 shrink-0 ${selected ? "text-accent" : "text-ink-muted"}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
          {source.status === "processing" && (
            <>
              <Spinner className="size-3" /> Processing…
            </>
          )}
          {source.status === "ready" && <>{typeLabels[source.type]} · Ready</>}
          {source.status === "failed" && (
            <span className="text-danger">Couldn't process</span>
          )}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete ${name}`}
        className="rounded p-1 text-ink-muted opacity-0 transition-opacity duration-150
          hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

import { BookOpen } from "lucide-react";
import type { Source } from "@/lib/types";

const typeLabels: Record<Source["type"], string> = {
  pdf: "PDF",
  docx: "Word document",
  csv: "Spreadsheet",
  txt: "Text file",
  text: "Text",
  url: "Web page",
};

export function ContentPanel({ source }: { source: Source | null }) {
  if (!source) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <BookOpen className="size-8 text-ink-muted" />
        <p className="text-sm text-ink-muted">
          Select a source to see what it's about.
        </p>
      </div>
    );
  }

  const name =
    source.title ?? source.originalName ?? source.sourceUrl ?? "Untitled";
  const added = new Date(source.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-8">
      <p className="type-label">
        {typeLabels[source.type]} · Added {added}
      </p>

      <h1 className="type-display mt-2 text-2xl leading-snug text-ink sm:text-3xl">
        {name}
      </h1>

      {source.status === "failed" && (
        <div className="mt-5 rounded-lg border border-danger/40 bg-danger-soft p-4 text-sm text-danger">
          We couldn't process this source
          {source.error ? ` — ${source.error.toLowerCase()}` : ""}. Try deleting
          it and adding it again.
        </div>
      )}

      {source.status === "processing" && (
        <p className="mt-5 text-sm text-ink-muted">
          We're reading your document — this usually takes a few seconds.
        </p>
      )}

      {source.summary && (
        <>
          <p className="type-label mt-8">Summary</p>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-muted">
            {source.summary}
          </p>
        </>
      )}

      {source.sourceUrl && (
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          Open original page
        </a>
      )}
    </div>
  );
}

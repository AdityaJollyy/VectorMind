import { BookOpen } from "lucide-react";
import type { Source } from "@/lib/types";

export function ContentPanel({ source }: { source: Source | null }) {
  if (!source) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <BookOpen className="size-8 text-ink-muted" />
        <p className="text-sm text-ink-muted">
          Select a source to see its overview.
        </p>
      </div>
    );
  }

  const name =
    source.title ?? source.originalName ?? source.sourceUrl ?? "Untitled";

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
        {source.type} · {source.chunkCount} chunks ·{" "}
        {new Date(source.createdAt).toLocaleDateString()}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
        {name}
      </h1>

      {source.status === "failed" && (
        <div className="mt-4 rounded-lg bg-danger-soft p-4 text-sm text-danger">
          Processing failed: {source.error ?? "unknown error"}. Delete this
          source and try again.
        </div>
      )}

      {source.status === "processing" && (
        <p className="mt-4 text-sm text-ink-muted">
          Reading and indexing this source — the overview will appear shortly.
        </p>
      )}

      {source.summary && (
        <>
          <h2 className="mt-8 text-sm font-semibold text-ink">Overview</h2>
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
          className="mt-6 inline-block text-sm text-accent underline underline-offset-2
            hover:text-accent-hover"
        >
          Open original page
        </a>
      )}
    </div>
  );
}

import { Spinner } from "@/components/ui/Spinner";
import { AddSource } from "./AddSource";
import { SourceItem } from "./SourceItem";
import { useDeleteSource, useSources } from "@/hooks/useSources";
import type { Source } from "@/lib/types";

interface SourcesPanelProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function SourcesPanel({ selectedId, onSelect }: SourcesPanelProps) {
  const { data: sources, isLoading } = useSources();
  const deleteSource = useDeleteSource((id) => {
    if (id === selectedId) onSelect(null);
  });

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <AddSource onCreated={(source: Source) => onSelect(source.id)} />

      <div className="flex-1 space-y-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner className="size-5 text-ink-muted" />
          </div>
        )}

        {!isLoading && sources?.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-ink-muted">
            Add your first source above to start a conversation with it.
          </p>
        )}

        {sources?.map((source) => (
          <SourceItem
            key={source.id}
            source={source}
            selected={source.id === selectedId}
            onSelect={() => onSelect(source.id)}
            onDelete={() => deleteSource.mutate(source.id)}
          />
        ))}
      </div>
    </div>
  );
}

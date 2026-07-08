import { useRef, useState } from "react";
import { Link2, Plus, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateText, useCreateUrl, useUploadFile } from "@/hooks/useSources";
import type { Source } from "@/lib/types";

type Mode = "file" | "text" | "url";

const tabs: { mode: Mode; label: string; icon: typeof Upload }[] = [
  { mode: "file", label: "File", icon: Upload },
  { mode: "text", label: "Text", icon: Type },
  { mode: "url", label: "Link", icon: Link2 },
];

export function AddSource({
  onCreated,
}: {
  onCreated: (source: Source) => void;
}) {
  const [mode, setMode] = useState<Mode>("file");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useUploadFile(onCreated);
  const createText = useCreateText((s) => {
    setText("");
    onCreated(s);
  });
  const createUrl = useCreateUrl((s) => {
    setUrl("");
    onCreated(s);
  });

  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="mb-3 flex gap-1 rounded-lg bg-surface-2 p-1">
        {tabs.map(({ mode: m, label, icon: TabIcon }) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5
              text-xs font-medium transition-colors duration-150
              ${mode === m ? "bg-accent text-on-accent" : "text-ink-muted hover:text-ink"}`}
          >
            <TabIcon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === "file" && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.csv,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile.mutate(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            loading={uploadFile.isPending}
            onClick={() => fileRef.current?.click()}
            className="w-full border-dashed"
          >
            <Plus className="size-4" /> Upload a file
          </Button>
          <p className="mt-2 text-center text-[11px] text-ink-muted">
            PDF, Word, CSV, or TXT
          </p>
        </>
      )}

      {mode === "text" && (
        <div className="flex flex-col gap-2">
          <Textarea
            rows={4}
            placeholder="Paste any text you want to ask about…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            loading={createText.isPending}
            disabled={!text.trim()}
            onClick={() => createText.mutate(text.trim())}
          >
            Add text
          </Button>
        </div>
      )}

      {mode === "url" && (
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            loading={createUrl.isPending}
            disabled={!url.trim()}
            onClick={() => createUrl.mutate(url.trim())}
          >
            Add page
          </Button>
        </div>
      )}
    </div>
  );
}

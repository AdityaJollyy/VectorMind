import { isValidElement, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/** Extract language + raw text from the <code> child react-markdown passes to <pre>. */
function parseCode(children: ReactNode): { language: string; code: string } {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const className = children.props.className ?? "";
    const language = /language-(\w+)/.exec(className)?.[1] ?? "text";
    const raw = children.props.children;
    return {
      language,
      code: typeof raw === "string" ? raw.replace(/\n$/, "") : "",
    };
  }
  return { language: "text", code: "" };
}

export function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const { language, code } = parseCode(children);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-xs text-ink-muted">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 font-mono text-xs text-ink-muted
            transition-colors hover:text-ink"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#14181c] p-4 font-mono text-[13px] leading-relaxed text-[#e8eae6]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

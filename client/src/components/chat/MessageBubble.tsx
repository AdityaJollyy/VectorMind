import { Markdown } from "@/components/markdown/Markdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft px-4 py-2.5 text-sm text-ink">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-full">
      <Markdown content={content} />
    </div>
  );
}

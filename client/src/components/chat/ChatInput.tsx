import { useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";

interface ChatInputProps {
  disabled: boolean;
  onSend: (question: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const question = value.trim();
    if (!question || disabled) return;
    onSend(question);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="relative">
      <Textarea
        rows={1}
        placeholder="Ask about this source…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        className="max-h-40 min-h-11 py-2.5 pr-12"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="absolute bottom-2 right-2 rounded-lg bg-accent p-1.5 text-on-accent
          transition-colors duration-150 hover:bg-accent-hover disabled:opacity-40"
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}

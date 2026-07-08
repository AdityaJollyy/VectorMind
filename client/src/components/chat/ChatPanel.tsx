import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import type { Source } from "@/lib/types";

export function ChatPanel({ source }: { source: Source | null }) {
  const sourceReady = source?.status === "ready";
  const {
    messages,
    isLoading,
    pendingQuestion,
    streamingAnswer,
    isStreaming,
    send,
  } = useChat(sourceReady ? source.id : null);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingAnswer]);

  if (!source || !sourceReady) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <MessagesSquare className="size-8 text-ink-muted" />
        <p className="text-sm text-ink-muted">
          {source
            ? "Getting your document ready — chat will open in a moment."
            : "Select a source to start chatting."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner className="size-5 text-ink-muted" />
          </div>
        )}

        {!isLoading && messages.length === 0 && !isStreaming && (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-ink">
              Ask anything about this document
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Answers come only from its content — try "What is this about?"
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {pendingQuestion && (
          <MessageBubble role="user" content={pendingQuestion} />
        )}
        {isStreaming &&
          (streamingAnswer ? (
            <MessageBubble role="assistant" content={streamingAnswer} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <Spinner className="size-3.5" /> Thinking…
            </p>
          ))}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-3">
        <ChatInput disabled={isStreaming} onSend={send} />
      </div>
    </div>
  );
}

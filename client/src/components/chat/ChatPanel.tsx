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
            ? "This source is still processing — chat opens when it is ready."
            : "Select a ready source to start chatting."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner className="size-5 text-ink-muted" />
          </div>
        )}

        {!isLoading && messages.length === 0 && !isStreaming && (
          <p className="py-8 text-center text-sm text-ink-muted">
            Ask anything about this source — answers come only from its content.
          </p>
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
            <Spinner className="size-4 text-ink-muted" />
          ))}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-3">
        <ChatInput disabled={isStreaming} onSend={send} />
      </div>
    </div>
  );
}

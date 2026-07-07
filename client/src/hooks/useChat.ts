import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { streamChat } from "@/lib/sse";
import type { ApiEnvelope, Message } from "@/lib/types";

export function useChat(sourceId: string | null) {
  const queryClient = useQueryClient();
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const isStreaming = pendingQuestion !== null;

  const messagesQuery = useQuery({
    queryKey: ["messages", sourceId],
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<{ messages: Message[] }>>(
        `/sources/${sourceId}/messages`
      );
      return res.data.data.messages;
    },
    enabled: !!sourceId,
  });

  async function send(question: string) {
    if (!sourceId || isStreaming) return;
    setPendingQuestion(question);
    setStreamingAnswer("");
    try {
      await streamChat(sourceId, question, {
        onToken: (token) => setStreamingAnswer((prev) => prev + token),
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["messages", sourceId] });
      setPendingQuestion(null);
      setStreamingAnswer("");
    }
  }

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    pendingQuestion,
    streamingAnswer,
    isStreaming,
    send,
  };
}

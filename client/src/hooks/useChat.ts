import { useEffect, useRef, useState } from "react";
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

  // Network arrival (target) is decoupled from what's displayed (shown):
  // a rAF loop reveals text smoothly even when tokens arrive in big bursts.
  const targetRef = useRef("");
  const shownRef = useRef("");
  const rafRef = useRef<number | null>(null);

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

  function stopReveal() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function startReveal() {
    if (rafRef.current !== null) return;
    const tick = () => {
      const target = targetRef.current;
      const shown = shownRef.current;
      if (shown.length < target.length) {
        // Adaptive speed: reveal ~1/20th of the backlog per frame (min 2 chars),
        // so it stays smooth but never lags far behind the real stream.
        const remaining = target.length - shown.length;
        const step = Math.max(2, Math.ceil(remaining / 20));
        shownRef.current = target.slice(0, shown.length + step);
        setStreamingAnswer(shownRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  /** Resolve once the displayed text has caught up with the received text. */
  function waitForCatchUp(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (shownRef.current.length >= targetRef.current.length) resolve();
        else setTimeout(check, 40);
      };
      check();
    });
  }

  async function send(question: string) {
    if (!sourceId || isStreaming) return;
    setPendingQuestion(question);
    targetRef.current = "";
    shownRef.current = "";
    setStreamingAnswer("");
    startReveal();

    try {
      await streamChat(sourceId, question, {
        onToken: (token) => {
          targetRef.current += token;
        },
      });
      await waitForCatchUp(); // let the reveal finish before swapping to the saved message
    } catch (err) {
      // On error, show everything we received instantly.
      shownRef.current = targetRef.current;
      setStreamingAnswer(targetRef.current);
      toast.error(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      stopReveal();
      await queryClient.invalidateQueries({ queryKey: ["messages", sourceId] });
      setPendingQuestion(null);
      setStreamingAnswer("");
      targetRef.current = "";
      shownRef.current = "";
    }
  }

  // Clean up the animation loop if the component unmounts mid-stream.
  useEffect(() => stopReveal, []);

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    pendingQuestion,
    streamingAnswer,
    isStreaming,
    send,
  };
}

interface StreamHandlers {
  onToken: (token: string) => void;
}

/**
 * POST a question and consume the SSE response stream.
 * Resolves when the server sends `event: done`; rejects on any error.
 */
export async function streamChat(
  sourceId: string,
  question: string,
  { onToken }: StreamHandlers
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sources/${sourceId}/chat`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }
  );

  // Errors before streaming starts come back as normal JSON.
  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? "Failed to send message");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      let eventName = "message";
      let data = "";
      for (const line of event.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) data = line.slice(5).trim();
      }

      if (eventName === "error") {
        const parsed = JSON.parse(data) as { message?: string };
        throw new Error(parsed.message ?? "Something went wrong");
      }
      if (eventName === "done") return;
      if (data) {
        const parsed = JSON.parse(data) as { token?: string };
        if (parsed.token) onToken(parsed.token);
      }
    }
  }
}

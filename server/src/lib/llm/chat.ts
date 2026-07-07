import OpenAI from 'openai';
import { gemini } from './client';

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

interface CompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

/** Single-shot completion; returns the full text. */
export async function complete(options: CompletionOptions): Promise<string> {
  const response = await gemini.chat.completions.create({
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens,
  });
  return response.choices[0]?.message?.content ?? '';
}

/** Streaming completion; yields text deltas as they arrive. */
export async function* completeStream(options: CompletionOptions): AsyncGenerator<string> {
  const stream = await gemini.chat.completions.create({
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

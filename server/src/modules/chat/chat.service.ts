import { Types } from 'mongoose';
import { Source } from '../../models/source.model';
import { Message, type MessageDocument } from '../../models/message.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { RETRIEVAL_TOP_K } from '../../config/constants';
import { embedQuery } from '../../lib/llm/embeddings';
import { searchChunks } from '../../lib/vector/qdrant';
import { completeStream, type ChatMessage } from '../../lib/llm/chat';

const MAX_HISTORY_MESSAGES = 6;

export function toMessageDTO(message: MessageDocument) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  };
}

/** Ensure the source exists, belongs to the user, and finished processing. */
export async function assertSourceReady(userId: string, sourceId: string): Promise<void> {
  if (!Types.ObjectId.isValid(sourceId)) throw ApiError.notFound('Source not found');
  const source = await Source.findOne({ _id: sourceId, userId });
  if (!source) throw ApiError.notFound('Source not found');
  if (source.status !== 'ready') {
    throw ApiError.badRequest(`Source is not ready yet (status: ${source.status})`);
  }
}

export async function getHistory(userId: string, sourceId: string) {
  if (!Types.ObjectId.isValid(sourceId)) throw ApiError.notFound('Source not found');
  const messages = await Message.find({ userId, sourceId }).sort({ createdAt: 1 });
  return messages.map(toMessageDTO);
}

/** Retrieve the most relevant chunks for the question and format them as context. */
async function retrieveContext(
  userId: string,
  sourceId: string,
  question: string,
): Promise<string> {
  const queryVector = await embedQuery(question);
  const results = await searchChunks(queryVector, userId, sourceId, RETRIEVAL_TOP_K);
  if (results.length === 0) return '';
  return results.map((r, i) => `[Excerpt ${i + 1}]\n${r.text}`).join('\n\n---\n\n');
}

function buildSystemPrompt(context: string): string {
  if (!context) {
    return (
      'You are a helpful assistant answering questions about a document. ' +
      'No relevant excerpts were found for this question, so tell the user you could not find ' +
      'the answer in the document.'
    );
  }
  return (
    'You are a helpful assistant that answers questions about a specific document.\n' +
    'Answer using ONLY the context excerpts below. If the answer is not contained in them, ' +
    'say you could not find it in the document. Be concise and accurate.\n\n' +
    `Context:\n${context}`
  );
}

/**
 * Run RAG and stream the answer. Persists the user message up front and the
 * assistant message once streaming completes.
 */
export async function* streamChatAnswer(
  userId: string,
  sourceId: string,
  question: string,
): AsyncGenerator<string> {
  const context = await retrieveContext(userId, sourceId, question);

  // Load recent history (before persisting the current question).
  const recent = await Message.find({ userId, sourceId })
    .sort({ createdAt: -1 })
    .limit(MAX_HISTORY_MESSAGES);
  recent.reverse(); // back to chronological order

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(context) },
    ...recent.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    { role: 'user', content: question },
  ];

  // Persist the user's message.
  await Message.create({
    userId: new Types.ObjectId(userId),
    sourceId: new Types.ObjectId(sourceId),
    role: 'user',
    content: question,
  });

  // Stream, accumulating the full answer to persist afterwards.
  let answer = '';
  for await (const token of completeStream({ model: env.GEMINI_CHAT_MODEL, messages })) {
    answer += token;
    yield token;
  }

  if (answer.trim()) {
    await Message.create({
      userId: new Types.ObjectId(userId),
      sourceId: new Types.ObjectId(sourceId),
      role: 'assistant',
      content: answer,
    });
  }
}

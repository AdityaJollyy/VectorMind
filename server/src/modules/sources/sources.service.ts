import { randomUUID } from 'node:crypto';
import { Types } from 'mongoose';
import { Source, type SourceType, type SourceDocument } from '../../models/source.model';
import { Message } from '../../models/message.model';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import { MAX_TEXT_LENGTH } from '../../config/constants';
import { loadSourceText, type LoaderInput } from '../../lib/loaders';
import { splitText } from '../../lib/chunking/splitter';
import { embedTexts } from '../../lib/llm/embeddings';
import { complete } from '../../lib/llm/chat';
import { upsertChunks, deleteSourceChunks, type ChunkPoint } from '../../lib/vector/qdrant';

interface CreateSourceParams {
  type: SourceType;
  loaderInput: LoaderInput;
  originalName?: string | null;
  sourceUrl?: string | null;
}

/** Serialize a source document into the shape the API returns. */
export function toSourceDTO(source: SourceDocument) {
  return {
    id: source.id,
    type: source.type,
    status: source.status,
    title: source.title,
    summary: source.summary,
    originalName: source.originalName,
    sourceUrl: source.sourceUrl,
    chunkCount: source.chunkCount,
    error: source.error,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

/** Create a source (status: processing) and kick off ingestion in the background. */
export async function createSource(
  userId: string,
  params: CreateSourceParams,
): Promise<SourceDocument> {
  const source = await Source.create({
    userId: new Types.ObjectId(userId),
    type: params.type,
    status: 'processing',
    originalName: params.originalName ?? null,
    sourceUrl: params.sourceUrl ?? null,
  });

  // Fire-and-forget: respond now, process in the background.
  void processIngestion(source, params.loaderInput).catch((err) => {
    logger.error({ err, sourceId: source.id }, 'Unhandled ingestion error');
  });

  return source;
}

/** The full ingestion pipeline. Updates the source's status when done. */
async function processIngestion(source: SourceDocument, input: LoaderInput): Promise<void> {
  const userId = source.userId.toString();
  const sourceId = source.id;

  try {
    const rawText = await loadSourceText(input);
    const text = rawText.trim().slice(0, MAX_TEXT_LENGTH);
    if (text.length < 20) {
      throw ApiError.badRequest('Could not extract meaningful text from this source');
    }

    const chunks = splitText(text);
    if (chunks.length === 0) {
      throw ApiError.badRequest('No content to index');
    }

    const vectors = await embedTexts(chunks);

    const points: ChunkPoint[] = chunks.map((chunkText, i) => ({
      id: randomUUID(),
      vector: vectors[i]!,
      userId,
      sourceId,
      text: chunkText,
      chunkIndex: i,
    }));
    await upsertChunks(points);

    const { title, summary } = await generateTitleAndSummary(text);

    source.status = 'ready';
    source.title = title;
    source.summary = summary;
    source.chunkCount = chunks.length;
    source.error = null;
    await source.save();
    logger.info({ sourceId, chunks: chunks.length }, 'Source ingested');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ingestion failed';
    logger.error({ err, sourceId }, 'Ingestion failed');
    // Clean up any partial vectors and mark the source failed.
    await deleteSourceChunks(userId, sourceId).catch(() => {});
    source.status = 'failed';
    source.error = message;
    await source.save().catch(() => {});
  }
}

/** Ask the (cheaper, separate-quota) summary model for a title + summary. */
async function generateTitleAndSummary(text: string): Promise<{ title: string; summary: string }> {
  const excerpt = text.slice(0, 6000);
  const raw = await complete({
    model: env.GEMINI_SUMMARY_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You generate metadata for documents. Respond with ONLY a JSON object of the form ' +
          '{"title": string, "summary": string}. Title is at most 8 words. Summary is 2-3 sentences. ' +
          'No markdown, no code fences.',
      },
      { role: 'user', content: `Document excerpt:\n\n${excerpt}` },
    ],
  });

  // Defensive parse: strip accidental code fences and fall back gracefully.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as { title?: unknown; summary?: unknown };
    const title =
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : 'Untitled source';
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    return { title: title.slice(0, 120), summary: summary.slice(0, 2000) };
  } catch {
    return { title: 'Untitled source', summary: '' };
  }
}

export async function listSources(userId: string): Promise<SourceDocument[]> {
  return Source.find({ userId }).sort({ createdAt: -1 });
}

export async function getSource(userId: string, sourceId: string): Promise<SourceDocument> {
  if (!Types.ObjectId.isValid(sourceId)) throw ApiError.notFound('Source not found');
  const source = await Source.findOne({ _id: sourceId, userId });
  if (!source) throw ApiError.notFound('Source not found');
  return source;
}

export async function deleteSource(userId: string, sourceId: string): Promise<void> {
  const source = await getSource(userId, sourceId); // 404 if not owned
  await deleteSourceChunks(userId, sourceId).catch(() => {});
  await Message.deleteMany({ userId, sourceId });
  await source.deleteOne();
}

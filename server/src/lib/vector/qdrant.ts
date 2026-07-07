import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export const qdrant = new QdrantClient({
  url: env.QDRANT_URL,
  apiKey: env.QDRANT_API_KEY,
});

const COLLECTION = env.QDRANT_COLLECTION;

/** Create the collection (and payload indexes) if it doesn't already exist. Idempotent. */
export async function ensureCollection(): Promise<void> {
  const { exists } = await qdrant.collectionExists(COLLECTION);
  if (exists) return;

  await qdrant.createCollection(COLLECTION, {
    vectors: { size: env.EMBEDDING_DIMENSIONS, distance: 'Cosine' },
  });

  // Index the fields we filter on, so filtered search stays fast.
  await qdrant.createPayloadIndex(COLLECTION, { field_name: 'userId', field_schema: 'keyword' });
  await qdrant.createPayloadIndex(COLLECTION, { field_name: 'sourceId', field_schema: 'keyword' });

  logger.info(`Qdrant collection "${COLLECTION}" created`);
}

export interface ChunkPoint {
  id: string; // UUID
  vector: number[];
  userId: string;
  sourceId: string;
  text: string;
  chunkIndex: number;
}

/** Insert or update chunk vectors. */
export async function upsertChunks(points: ChunkPoint[]): Promise<void> {
  if (points.length === 0) return;
  await qdrant.upsert(COLLECTION, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: { userId: p.userId, sourceId: p.sourceId, text: p.text, chunkIndex: p.chunkIndex },
    })),
  });
}

export interface SearchResult {
  text: string;
  chunkIndex: number;
  score: number;
}

/** Vector search scoped to a single source owned by a single user. */
export async function searchChunks(
  queryVector: number[],
  userId: string,
  sourceId: string,
  topK: number,
): Promise<SearchResult[]> {
  const results = await qdrant.search(COLLECTION, {
    vector: queryVector,
    limit: topK,
    filter: {
      must: [
        { key: 'userId', match: { value: userId } },
        { key: 'sourceId', match: { value: sourceId } },
      ],
    },
    with_payload: true,
  });

  return results.map((r) => ({
    text: String(r.payload?.text ?? ''),
    chunkIndex: Number(r.payload?.chunkIndex ?? 0),
    score: r.score,
  }));
}

/** Delete all chunks for a source (used on source deletion or failed ingestion). */
export async function deleteSourceChunks(userId: string, sourceId: string): Promise<void> {
  await qdrant.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [
        { key: 'userId', match: { value: userId } },
        { key: 'sourceId', match: { value: sourceId } },
      ],
    },
  });
}

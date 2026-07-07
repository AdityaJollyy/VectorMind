import { gemini } from './client';
import { env } from '../../config/env';

// How many texts to send per embedding request. Gemini returns one vector per input.
const EMBED_BATCH_SIZE = 96;

/**
 * L2-normalize a vector to unit length.
 * Required for gemini-embedding-001 when using fewer than 3072 dimensions.
 */
function normalize(vector: number[]): number[] {
  let sumSquares = 0;
  for (const value of vector) sumSquares += value * value;
  const magnitude = Math.sqrt(sumSquares);
  if (magnitude === 0) return vector;
  return vector.map((value) => value / magnitude);
}

/** Embed many texts. Returns one normalized vector per input, in the same order. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const response = await gemini.embeddings.create({
      model: env.GEMINI_EMBEDDING_MODEL,
      input: batch,
      dimensions: env.EMBEDDING_DIMENSIONS, // maps to Gemini's output_dimensionality
    });

    // Sort by index to guarantee order matches the input array.
    const sorted = [...response.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const item of sorted) {
      vectors.push(normalize(item.embedding as number[]));
    }
  }

  return vectors;
}

/** Embed a single query string. */
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  if (!vector) throw new Error('Failed to generate embedding');
  return vector;
}

import { randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { embedTexts } from '../lib/llm/embeddings';
import { complete } from '../lib/llm/chat';
import {
  ensureCollection,
  upsertChunks,
  searchChunks,
  deleteSourceChunks,
} from '../lib/vector/qdrant';

async function main() {
  console.log('1) Embedding...');
  const texts = ['The Eiffel Tower is in Paris.', 'Cats are small domesticated animals.'];
  const vectors = await embedTexts(texts);
  const norm = Math.sqrt(vectors[0]!.reduce((s, v) => s + v * v, 0));
  console.log(
    `   dims=${vectors[0]!.length} (expected ${env.EMBEDDING_DIMENSIONS}), ` +
      `norm≈${norm.toFixed(4)} (expected ~1.0000)`,
  );

  console.log('2) Qdrant upsert + search...');
  await ensureCollection();
  const userId = 'smoke-user';
  const sourceId = 'smoke-source';
  await upsertChunks(
    vectors.map((vector, i) => ({
      id: randomUUID(),
      vector,
      userId,
      sourceId,
      text: texts[i]!,
      chunkIndex: i,
    })),
  );
  const [queryVec] = await embedTexts(['Where is the Eiffel Tower?']);
  const results = await searchChunks(queryVec!, userId, sourceId, 2);
  console.log(`   top match: "${results[0]?.text}" (score ${results[0]?.score.toFixed(3)})`);

  console.log('3) Chat model...');
  const answer = await complete({
    model: env.GEMINI_CHAT_MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
  });
  console.log(`   model replied: "${answer.trim()}"`);

  console.log('4) Cleanup...');
  await deleteSourceChunks(userId, sourceId);
  console.log('Smoke test passed.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Smoke test failed:', err);
    process.exit(1);
  });

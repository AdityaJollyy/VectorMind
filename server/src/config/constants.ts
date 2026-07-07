// Text chunking (used during ingestion)
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 150;

// How many chunks to retrieve per query for RAG
export const RETRIEVAL_TOP_K = 5;

// Upload / input limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_TEXT_LENGTH = 100_000; // characters

// Per-user AI operations (ingestion + chat) allowed per day, enforced in production only.
export const DAILY_AI_LIMIT = 50;

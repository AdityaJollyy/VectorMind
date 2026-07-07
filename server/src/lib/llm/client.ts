import OpenAI from 'openai';
import { env } from '../../config/env';

// The OpenAI SDK, pointed at Gemini's OpenAI-compatible endpoint.
// maxRetries → built-in exponential backoff on 429 / 5xx. timeout → per-request cap.
export const gemini = new OpenAI({
  apiKey: env.GEMINI_API_KEY,
  baseURL: env.GEMINI_BASE_URL,
  maxRetries: 4,
  timeout: 60_000,
});

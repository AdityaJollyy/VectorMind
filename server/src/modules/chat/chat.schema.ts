import { z } from 'zod';

export const chatMessageSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(2000),
});

export type ChatInput = z.infer<typeof chatMessageSchema>;

import { z } from 'zod';
import { MAX_TEXT_LENGTH } from '../../config/constants';

export const createTextSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(MAX_TEXT_LENGTH),
});

export const createUrlSchema = z.object({
  url: z.url('A valid URL is required'),
});

export type CreateTextInput = z.infer<typeof createTextSchema>;
export type CreateUrlInput = z.infer<typeof createUrlSchema>;

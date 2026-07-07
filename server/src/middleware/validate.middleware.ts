import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

/** Validates req.body against the schema and replaces it with the parsed result. */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error); // ZodError → handled by the central error middleware
      return;
    }
    req.body = result.data;
    next();
  };
}

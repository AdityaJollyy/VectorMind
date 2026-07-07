import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { stringParam } from '../../utils/params';
import { assertSourceReady, streamChatAnswer, getHistory } from './chat.service';
import type { ChatInput } from './chat.schema';

export async function getMessages(req: Request, res: Response) {
  const sourceId = stringParam(req, 'id');
  const messages = await getHistory(req.userId!, sourceId);
  res.status(200).json(new ApiResponse(200, 'Messages', { messages }));
}

export async function chat(req: Request, res: Response) {
  const sourceId = stringParam(req, 'id');
  const { question } = req.body as ChatInput;

  // Validate BEFORE switching to SSE so errors return clean JSON.
  await assertSourceReady(req.userId!, sourceId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    for await (const token of streamChatAnswer(req.userId!, sourceId, question)) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    res.write('event: done\ndata: {}\n\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  } finally {
    res.end();
  }
}

import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { createSource, listSources, getSource, deleteSource, toSourceDTO } from './sources.service';
import type { CreateTextInput, CreateUrlInput } from './sources.schema';
import { stringParam } from '../../utils/params';

type FileSourceType = 'pdf' | 'docx' | 'csv' | 'txt';

const MIME_TO_TYPE: Record<string, FileSourceType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/csv': 'csv',
  'application/csv': 'csv',
  'text/plain': 'txt',
};

function detectFileType(file: Express.Multer.File): FileSourceType | null {
  const byMime = MIME_TO_TYPE[file.mimetype];
  if (byMime) return byMime;
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (ext === 'csv') return 'csv';
  if (ext === 'txt' || ext === 'text') return 'txt';
  return null;
}

export async function uploadSource(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw ApiError.badRequest('No file uploaded');

  const type = detectFileType(file);
  if (!type) throw ApiError.badRequest('Unsupported file type. Use PDF, DOCX, CSV, or TXT.');

  const source = await createSource(req.userId!, {
    type,
    loaderInput: { type, buffer: file.buffer },
    originalName: file.originalname,
  });
  res
    .status(202)
    .json(
      new ApiResponse(202, 'File uploaded and processing started', { source: toSourceDTO(source) }),
    );
}

export async function createTextSource(req: Request, res: Response) {
  const { content } = req.body as CreateTextInput;
  const source = await createSource(req.userId!, {
    type: 'text',
    loaderInput: { type: 'text', content },
  });
  res
    .status(202)
    .json(
      new ApiResponse(202, 'Text received and processing started', { source: toSourceDTO(source) }),
    );
}

export async function createUrlSource(req: Request, res: Response) {
  const { url } = req.body as CreateUrlInput;
  const source = await createSource(req.userId!, {
    type: 'url',
    loaderInput: { type: 'url', url },
    sourceUrl: url,
  });
  res
    .status(202)
    .json(
      new ApiResponse(202, 'URL received and processing started', { source: toSourceDTO(source) }),
    );
}

export async function getSources(req: Request, res: Response) {
  const sources = await listSources(req.userId!);
  res.status(200).json(new ApiResponse(200, 'Sources', { sources: sources.map(toSourceDTO) }));
}

export async function getSourceById(req: Request, res: Response) {
  const source = await getSource(req.userId!, stringParam(req, 'id'));
  res.status(200).json(new ApiResponse(200, 'Source', { source: toSourceDTO(source) }));
}

export async function removeSource(req: Request, res: Response) {
  await deleteSource(req.userId!, stringParam(req, 'id'));
  res.status(200).json(new ApiResponse(200, 'Source deleted'));
}

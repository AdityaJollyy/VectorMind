import { ApiError } from '../../utils/ApiError';
import { loadPdf } from './pdf.loader';
import { loadDocx } from './docx.loader';
import { loadCsv } from './csv.loader';
import { loadUrl } from './url.loader';

export type LoaderInput =
  | { type: 'pdf' | 'docx' | 'csv' | 'txt'; buffer: Buffer }
  | { type: 'text'; content: string }
  | { type: 'url'; url: string };

/** Turn any supported source into clean plain text. */
export async function loadSourceText(input: LoaderInput): Promise<string> {
  switch (input.type) {
    case 'pdf':
      return loadPdf(input.buffer);
    case 'docx':
      return loadDocx(input.buffer);
    case 'csv':
      return loadCsv(input.buffer);
    case 'txt':
      return input.buffer.toString('utf-8');
    case 'text':
      return input.content;
    case 'url':
      return loadUrl(input.url);
    default: {
      // Exhaustiveness guard: if a new type is added to the union and not
      // handled above, TypeScript will flag this line at compile time.
      const _exhaustive: never = input;
      throw ApiError.badRequest('Unsupported source type');
    }
  }
}

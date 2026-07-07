import * as cheerio from 'cheerio';
import { ApiError } from '../../utils/ApiError';

export async function loadUrl(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NotebookLM-AI/1.0)' },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw ApiError.badRequest('Could not fetch the provided URL');
  }

  if (!response.ok) {
    throw ApiError.badRequest(`Failed to fetch URL (status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Drop non-content elements before extracting text.
  $('script, style, noscript, nav, header, footer, iframe, svg').remove();

  return $('body').text().replace(/\s+/g, ' ').trim();
}

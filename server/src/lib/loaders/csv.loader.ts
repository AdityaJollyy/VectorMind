import Papa from 'papaparse';

export function loadCsv(buffer: Buffer): string {
  const csv = buffer.toString('utf-8');
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (rows.length === 0) return csv; // fall back to raw text

  // Render each row as readable "key: value" pairs — embeds better than raw CSV.
  return rows
    .map(
      (row, i) =>
        `Row ${i + 1}: ${Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`,
    )
    .join('\n');
}

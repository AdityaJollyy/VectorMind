import { CHUNK_SIZE, CHUNK_OVERLAP } from '../../config/constants';

/**
 * Break text into "atoms" no larger than maxLen, preferring natural boundaries:
 * paragraph → sentence → word → hard character slice (last resort).
 */
function splitToAtoms(text: string, maxLen: number): string[] {
  const atoms: string[] = [];

  for (const rawPara of text.split(/\n\s*\n/)) {
    const para = rawPara.replace(/\s+/g, ' ').trim();
    if (!para) continue;

    if (para.length <= maxLen) {
      atoms.push(para);
      continue;
    }

    for (const rawSentence of para.split(/(?<=[.!?])\s+/)) {
      const sentence = rawSentence.trim();
      if (!sentence) continue;

      if (sentence.length <= maxLen) {
        atoms.push(sentence);
        continue;
      }

      // Sentence too long: accumulate word by word.
      let buffer = '';
      for (const word of sentence.split(/\s+/)) {
        const candidate = buffer ? `${buffer} ${word}` : word;
        if (candidate.length > maxLen) {
          if (buffer) atoms.push(buffer);
          if (word.length > maxLen) {
            // A single token longer than maxLen: hard-slice it.
            for (let i = 0; i < word.length; i += maxLen) {
              atoms.push(word.slice(i, i + maxLen));
            }
            buffer = '';
          } else {
            buffer = word;
          }
        } else {
          buffer = candidate;
        }
      }
      if (buffer) atoms.push(buffer);
    }
  }

  return atoms;
}

/** Greedily merge atoms into chunks up to chunkSize, keeping an overlap tail. */
function mergeAtoms(atoms: string[], chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let currentLen = 0;

  for (const atom of atoms) {
    const addLen = atom.length + (current.length ? 1 : 0); // +1 for the join space
    if (currentLen + addLen > chunkSize && current.length > 0) {
      chunks.push(current.join(' '));

      // Carry the tail of the previous chunk forward as overlap.
      const tail: string[] = [];
      let tailLen = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const a = current[i]!;
        if (tailLen + a.length > overlap) break;
        tail.unshift(a);
        tailLen += a.length + 1;
      }
      current = [...tail];
      currentLen = current.join(' ').length;
    }
    current.push(atom);
    currentLen += addLen;
  }

  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
}

/** Public API: split cleaned text into overlapping chunks. */
export function splitText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!clean) return [];
  return mergeAtoms(splitToAtoms(clean, chunkSize), chunkSize, overlap);
}

export type DelimiterMode = 'auto' | 'newline' | 'comma' | 'semicolon' | 'tab';

const DELIMITER_MAP: Record<Exclude<DelimiterMode, 'auto'>, string | RegExp> = {
  newline: /\r?\n/,
  comma: ',',
  semicolon: ';',
  tab: '\t'
};

export const COMMON_WORDS = new Set([
  'the',
  'and',
  'a',
  'an',
  'or',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of'
]);

export function detectDelimiter(raw: string): Exclude<DelimiterMode, 'auto'> {
  const counts = {
    newline: (raw.match(/\n/g) ?? []).length,
    comma: (raw.match(/,/g) ?? []).length,
    semicolon: (raw.match(/;/g) ?? []).length,
    tab: (raw.match(/\t/g) ?? []).length
  };

  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Exclude<DelimiterMode, 'auto'>) || 'newline';
}

export function splitItems(raw: string, delimiter: DelimiterMode): string[] {
  if (!raw.trim()) return [];
  const mode = delimiter === 'auto' ? detectDelimiter(raw) : delimiter;
  return raw
    .split(DELIMITER_MAP[mode])
    .map((item) => item.trim())
    .filter(Boolean);
}

export function estimateItemCount(raw: string, delimiter: DelimiterMode): number {
  return splitItems(raw, delimiter).length;
}

export function detectLongLines(raw: string, threshold = 10000): number {
  return raw.split(/\r?\n/).filter((line) => line.length > threshold).length;
}

export async function parseUploadedFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer);
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buffer);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('ascii').decode(buffer);
  }
}

export function parseFileContent(content: string, fileName: string): string {
  if (fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v)).join('\n');
    } catch {
      return content;
    }
  }
  if (fileName.endsWith('.csv')) {
    return content
      .split(/\r?\n/)
      .flatMap((line) => line.split(','))
      .map((v) => v.trim())
      .filter(Boolean)
      .join('\n');
  }
  return content;
}

export function applyRegexFilter(items: string[], pattern: string): string[] {
  if (!pattern.trim()) return items;
  try {
    const regex = new RegExp(pattern, 'u');
    return items.filter((item) => regex.test(item));
  } catch {
    return items;
  }
}

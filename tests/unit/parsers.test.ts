import { describe, expect, it } from 'vitest';
import {
  applyRegexFilter,
  detectDelimiter,
  detectLongLines,
  parseFileContent,
  parseUploadedFile,
  splitItems
} from '../../src/lib/utils/parsers';

describe('parsers', () => {
  it('detects comma delimiter', () => {
    expect(detectDelimiter('a,b,c')).toBe('comma');
  });

  it('splits newline by auto', () => {
    expect(splitItems('a\nb\n', 'auto')).toEqual(['a', 'b']);
  });

  it('applies regex filter safely', () => {
    expect(applyRegexFilter(['alpha', 'beta', 'alfa'], '^al')).toEqual(['alpha', 'alfa']);
    expect(applyRegexFilter(['alpha'], '[')).toEqual(['alpha']);
  });

  it('parses csv and json file content', () => {
    expect(parseFileContent('a,b\nc,d', 'items.csv')).toBe('a\nb\nc\nd');
    expect(parseFileContent('[\"a\",1,true]', 'items.json')).toBe('a\n1\ntrue');
    expect(parseFileContent('{\"x\":1}', 'items.json')).toBe('{\"x\":1}');
  });

  it('detects long lines', () => {
    expect(detectLongLines(`short\\n${'x'.repeat(10001)}`)).toBe(1);
  });

  it('parses utf-8 and utf-16 uploads', async () => {
    const utf8 = new File([new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x0a, 0x62])], 'a.txt');
    expect(await parseUploadedFile(utf8)).toContain('a');

    const utf16le = new File([new Uint8Array([0xff, 0xfe, 0x61, 0x00])], 'b.txt');
    expect(await parseUploadedFile(utf16le)).toContain('a');
  });
});

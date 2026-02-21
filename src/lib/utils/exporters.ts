import { toPng } from 'html-to-image';

export function downloadText(filename: string, lines: string[]) {
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  downloadBlob(filename, blob);
}

export function downloadCsv(filename: string, lines: string[]) {
  const csv = lines.map((line) => `"${line.replaceAll('"', '""')}"`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(filename, blob);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(filename, blob);
}

export async function copyToClipboard(lines: string[], asJson = false): Promise<void> {
  const payload = asJson ? JSON.stringify(lines, null, 2) : lines.join('\n');
  await navigator.clipboard.writeText(payload);
}

export async function exportNodeToPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(filename, blob);
}

export function buildShareUrl(listA: string, listB: string): string {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ a: listA, b: listB }))));
  const url = new URL(window.location.href);
  url.searchParams.set('d', payload);
  return url.toString();
}

export function decodeSharePayload(value: string): { a: string; b: string } | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(value))));
    if (typeof parsed.a === 'string' && typeof parsed.b === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

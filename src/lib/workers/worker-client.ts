import * as Comlink from 'comlink';
import { applyRegexFilter, splitItems } from '../utils/parsers';
import { compareLists, type ComparisonOptions, type ComparisonResult, type WorkerProgress } from '../utils/sets';

interface WorkerApi {
  compare: (
    payload: { listA: string; listB: string; options: ComparisonOptions },
    progressCb?: (progress: WorkerProgress) => void
  ) => Promise<ComparisonResult>;
}

let worker: Worker | null = null;
let api: Comlink.Remote<WorkerApi> | null = null;

export async function compareWithWorker(
  listA: string,
  listB: string,
  options: ComparisonOptions,
  onProgress?: (progress: WorkerProgress) => void
): Promise<ComparisonResult> {
  if (typeof Worker === 'undefined') {
    const a = applyRegexFilter(splitItems(listA, options.delimiter), options.regexFilter);
    const b = applyRegexFilter(splitItems(listB, options.delimiter), options.regexFilter);
    return compareLists(a, b, options, onProgress);
  }

  if (!worker) {
    worker = new Worker(new URL('./comparison.worker.ts', import.meta.url), { type: 'module' });
    api = Comlink.wrap<WorkerApi>(worker);
  }

  try {
    return await api!.compare({ listA, listB, options }, onProgress ? Comlink.proxy(onProgress) : undefined);
  } catch {
    const a = applyRegexFilter(splitItems(listA, options.delimiter), options.regexFilter);
    const b = applyRegexFilter(splitItems(listB, options.delimiter), options.regexFilter);
    return compareLists(a, b, options, onProgress);
  }
}

export function cleanupWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    api = null;
  }
}

import { COMMON_WORDS } from './parsers';

export type SortMode = 'alphabetical' | 'original';

export interface ComparisonOptions {
  caseSensitive: boolean;
  delimiter: 'auto' | 'newline' | 'comma' | 'semicolon' | 'tab';
  treatAsMultiset: boolean;
  fuzzyMatch: boolean;
  fuzzyDistance: number;
  ignoreCommonWords: boolean;
  regexFilter: string;
  sortMode: SortMode;
}

export interface ComparisonResult {
  normalizedA: string[];
  normalizedB: string[];
  intersection: string[];
  onlyA: string[];
  onlyB: string[];
  union: string[];
  stats: {
    sizeA: number;
    sizeB: number;
    intersection: number;
    union: number;
    onlyA: number;
    onlyB: number;
    jaccard: number;
  };
  metadata: {
    elapsedMs: number;
    usedFuzzy: boolean;
    multiset: boolean;
  };
}

export interface WorkerProgress {
  phase: string;
  value: number;
}

export interface MultiComparisonResult {
  listCount: number;
  perList: Array<{
    label: string;
    uniqueCount: number;
    exclusiveCount: number;
  }>;
  intersectionAll: string[];
  union: string[];
  overlapAtLeastTwo: string[];
}

export function normalizeItem(item: string, caseSensitive: boolean): string {
  const trimmed = item.trim();
  return caseSensitive ? trimmed : trimmed.toLocaleLowerCase();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
}

function shouldSkipWord(item: string, ignoreCommonWords: boolean): boolean {
  return ignoreCommonWords && COMMON_WORDS.has(item.toLocaleLowerCase());
}

export function sortItems(items: string[], sortMode: SortMode, orderMap?: Map<string, number>): string[] {
  if (sortMode === 'alphabetical') {
    return [...items].sort((a, b) => a.localeCompare(b));
  }
  if (!orderMap) return items;
  return [...items].sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0));
}

export function compareLists(
  listA: string[],
  listB: string[],
  options: ComparisonOptions,
  onProgress?: (progress: WorkerProgress) => void
): ComparisonResult {
  const started = performance.now();

  const orderMap = new Map<string, number>();
  let idx = 0;
  const normA = listA
    .map((item) => normalizeItem(item, options.caseSensitive))
    .filter((item) => item && !shouldSkipWord(item, options.ignoreCommonWords))
    .filter((item) => {
      if (!orderMap.has(item)) {
        orderMap.set(item, idx);
        idx += 1;
      }
      return true;
    });
  const normB = listB
    .map((item) => normalizeItem(item, options.caseSensitive))
    .filter((item) => item && !shouldSkipWord(item, options.ignoreCommonWords));

  const countA = new Map<string, number>();
  const countB = new Map<string, number>();
  for (const item of normA) countA.set(item, (countA.get(item) ?? 0) + 1);
  for (const item of normB) countB.set(item, (countB.get(item) ?? 0) + 1);

  const keysA = new Set(countA.keys());
  const keysB = new Set(countB.keys());

  const fuzzyPairs = new Map<string, string>();
  const fuzzyAllowed = options.fuzzyMatch && keysA.size * keysB.size <= 2_500_000;
  if (fuzzyAllowed) {
    onProgress?.({ phase: 'fuzzy matching', value: 0.25 });
    const arrB = [...keysB];
    for (const aItem of keysA) {
      const bucket = arrB.filter((bItem) => Math.abs(bItem.length - aItem.length) <= options.fuzzyDistance + 1);
      for (const bItem of bucket) {
        if (levenshtein(aItem, bItem) <= options.fuzzyDistance) {
          fuzzyPairs.set(aItem, bItem);
          break;
        }
      }
    }
  }

  const intersection: string[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];
  const usedB = new Set<string>();

  onProgress?.({ phase: 'set operations', value: 0.6 });

  for (const key of keysA) {
    const direct = countB.has(key);
    const fuzzy = fuzzyPairs.get(key);
    if (direct || fuzzy) {
      const bKey = direct ? key : fuzzy!;
      usedB.add(bKey);
      if (options.treatAsMultiset) {
        const shared = Math.min(countA.get(key) ?? 0, countB.get(bKey) ?? 0);
        for (let i = 0; i < shared; i += 1) intersection.push(key);
        const leftA = (countA.get(key) ?? 0) - shared;
        for (let i = 0; i < leftA; i += 1) onlyA.push(key);
      } else {
        intersection.push(key);
      }
    } else if (options.treatAsMultiset) {
      for (let i = 0; i < (countA.get(key) ?? 0); i += 1) onlyA.push(key);
    } else {
      onlyA.push(key);
    }
  }

  for (const key of keysB) {
    if (usedB.has(key) || keysA.has(key)) continue;
    if (options.treatAsMultiset) {
      for (let i = 0; i < (countB.get(key) ?? 0); i += 1) onlyB.push(key);
    } else {
      onlyB.push(key);
    }
  }

  if (options.treatAsMultiset) {
    for (const key of keysB) {
      if (!keysA.has(key)) continue;
      const shared = Math.min(countA.get(key) ?? 0, countB.get(key) ?? 0);
      const leftB = (countB.get(key) ?? 0) - shared;
      for (let i = 0; i < leftB; i += 1) onlyB.push(key);
    }
  }

  const unionSet = new Set([...keysA, ...keysB]);
  let union = [...unionSet];
  const sortedIntersection = sortItems(intersection, options.sortMode, orderMap);
  const sortedOnlyA = sortItems(onlyA, options.sortMode, orderMap);
  const sortedOnlyB = sortItems(onlyB, options.sortMode, orderMap);
  union = sortItems(union, options.sortMode, orderMap);

  const sizeA = options.treatAsMultiset ? normA.length : keysA.size;
  const sizeB = options.treatAsMultiset ? normB.length : keysB.size;
  const intersectionSize = sortedIntersection.length;
  const unionSize = options.treatAsMultiset ? sizeA + sizeB - intersectionSize : unionSet.size;

  onProgress?.({ phase: 'done', value: 1 });

  return {
    normalizedA: sortItems(normA, options.sortMode, orderMap),
    normalizedB: sortItems(normB, options.sortMode, orderMap),
    intersection: sortedIntersection,
    onlyA: sortedOnlyA,
    onlyB: sortedOnlyB,
    union,
    stats: {
      sizeA,
      sizeB,
      intersection: intersectionSize,
      union: unionSize,
      onlyA: sortedOnlyA.length,
      onlyB: sortedOnlyB.length,
      jaccard: unionSize === 0 ? 0 : intersectionSize / unionSize
    },
    metadata: {
      elapsedMs: performance.now() - started,
      usedFuzzy: fuzzyAllowed,
      multiset: options.treatAsMultiset
    }
  };
}

export function compareManyLists(listValues: string[][], options: ComparisonOptions): MultiComparisonResult {
  const normalizedSets = listValues.map((list) => {
    const set = new Set<string>();
    for (const raw of list) {
      const value = normalizeItem(raw, options.caseSensitive);
      if (!value) continue;
      if (options.ignoreCommonWords && COMMON_WORDS.has(value.toLocaleLowerCase())) continue;
      set.add(value);
    }
    return set;
  });

  const frequency = new Map<string, number>();
  for (const set of normalizedSets) {
    for (const item of set) {
      frequency.set(item, (frequency.get(item) ?? 0) + 1);
    }
  }

  const union = [...frequency.keys()].sort((a, b) => a.localeCompare(b));
  const intersectionAll = union.filter((item) => (frequency.get(item) ?? 0) === normalizedSets.length);
  const overlapAtLeastTwo = union.filter((item) => (frequency.get(item) ?? 0) >= 2);

  const perList = normalizedSets.map((set, index) => {
    let exclusiveCount = 0;
    for (const item of set) {
      if ((frequency.get(item) ?? 0) === 1) exclusiveCount += 1;
    }
    return {
      label: `List ${String.fromCharCode(65 + index)}`,
      uniqueCount: set.size,
      exclusiveCount
    };
  });

  return {
    listCount: normalizedSets.length,
    perList,
    intersectionAll,
    union,
    overlapAtLeastTwo
  };
}

import * as Comlink from 'comlink';
import { applyRegexFilter, splitItems, type DelimiterMode } from '../utils/parsers';
import { compareLists, type ComparisonOptions, type ComparisonResult, type WorkerProgress } from '../utils/sets';

interface WorkerInput {
  listA: string;
  listB: string;
  options: ComparisonOptions;
}

const api = {
  compare(payload: WorkerInput, progressCb?: (progress: WorkerProgress) => void): ComparisonResult {
    const a = applyRegexFilter(splitItems(payload.listA, payload.options.delimiter as DelimiterMode), payload.options.regexFilter);
    const b = applyRegexFilter(splitItems(payload.listB, payload.options.delimiter as DelimiterMode), payload.options.regexFilter);
    return compareLists(a, b, payload.options, progressCb);
  }
};

Comlink.expose(api);

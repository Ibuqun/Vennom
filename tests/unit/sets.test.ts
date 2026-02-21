import { describe, expect, it } from 'vitest';
import { compareLists, compareManyLists, levenshtein } from '../../src/lib/utils/sets';

describe('sets', () => {
  it('computes intersections and jaccard', () => {
    const res = compareLists(
      ['apple', 'banana', 'grape'],
      ['banana', 'grape', 'mango'],
      {
        caseSensitive: false,
        delimiter: 'newline',
        treatAsMultiset: false,
        fuzzyMatch: false,
        fuzzyDistance: 1,
        ignoreCommonWords: false,
        regexFilter: '',
        sortMode: 'alphabetical'
      }
    );
    expect(res.stats.intersection).toBe(2);
    expect(res.stats.onlyA).toBe(1);
    expect(res.stats.onlyB).toBe(1);
    expect(res.stats.union).toBe(4);
  });

  it('supports fuzzy matching', () => {
    const res = compareLists(
      ['color'],
      ['colour'],
      {
        caseSensitive: false,
        delimiter: 'newline',
        treatAsMultiset: false,
        fuzzyMatch: true,
        fuzzyDistance: 1,
        ignoreCommonWords: false,
        regexFilter: '',
        sortMode: 'alphabetical'
      }
    );
    expect(res.stats.intersection).toBe(1);
  });

  it('supports multiset and common word filtering', () => {
    const res = compareLists(
      ['the', 'cat', 'cat', 'dog'],
      ['cat', 'dog', 'dog'],
      {
        caseSensitive: false,
        delimiter: 'newline',
        treatAsMultiset: true,
        fuzzyMatch: false,
        fuzzyDistance: 1,
        ignoreCommonWords: true,
        regexFilter: '',
        sortMode: 'original'
      }
    );
    expect(res.stats.sizeA).toBe(3);
    expect(res.stats.intersection).toBe(2);
    expect(res.stats.onlyA).toBe(1);
    expect(res.stats.onlyB).toBe(1);
  });

  it('handles case sensitivity and large fuzzy disable', () => {
    const manyA = Array.from({ length: 1600 }, (_, i) => `a${i}`);
    const manyB = Array.from({ length: 1600 }, (_, i) => `A${i}`);
    const res = compareLists(manyA, manyB, {
      caseSensitive: true,
      delimiter: 'newline',
      treatAsMultiset: false,
      fuzzyMatch: true,
      fuzzyDistance: 1,
      ignoreCommonWords: false,
      regexFilter: '',
      sortMode: 'alphabetical'
    });
    expect(res.metadata.usedFuzzy).toBe(false);
    expect(res.stats.intersection).toBe(0);
  });

  it('computes levenshtein distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });

  it('computes multi-list overlap stats', () => {
    const res = compareManyLists(
      [
        ['apple', 'banana', 'kiwi'],
        ['banana', 'kiwi', 'melon'],
        ['kiwi', 'melon', 'pear']
      ],
      {
        caseSensitive: false,
        delimiter: 'newline',
        treatAsMultiset: false,
        fuzzyMatch: false,
        fuzzyDistance: 1,
        ignoreCommonWords: false,
        regexFilter: '',
        sortMode: 'alphabetical'
      }
    );
    expect(res.listCount).toBe(3);
    expect(res.intersectionAll).toEqual(['kiwi']);
    expect(res.union.length).toBe(5);
    expect(res.overlapAtLeastTwo).toEqual(['banana', 'kiwi', 'melon']);
    expect(res.perList[0].exclusiveCount).toBe(1);
  });

  it('respects case and common-word options in multi-list mode', () => {
    const caseInsensitive = compareManyLists(
      [
        ['The', 'Alpha'],
        ['the', 'alpha', 'beta']
      ],
      {
        caseSensitive: false,
        delimiter: 'newline',
        treatAsMultiset: false,
        fuzzyMatch: false,
        fuzzyDistance: 1,
        ignoreCommonWords: true,
        regexFilter: '',
        sortMode: 'alphabetical'
      }
    );
    expect(caseInsensitive.intersectionAll).toEqual(['alpha']);
    expect(caseInsensitive.union).toEqual(['alpha', 'beta']);

    const caseSensitive = compareManyLists(
      [
        ['Alpha'],
        ['alpha']
      ],
      {
        caseSensitive: true,
        delimiter: 'newline',
        treatAsMultiset: false,
        fuzzyMatch: false,
        fuzzyDistance: 1,
        ignoreCommonWords: false,
        regexFilter: '',
        sortMode: 'alphabetical'
      }
    );
    expect(caseSensitive.intersectionAll).toEqual([]);
  });
});

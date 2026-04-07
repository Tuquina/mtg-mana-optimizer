import { describe, expect, it } from 'vitest';
import {
  combination,
  findMinimumColoredSources,
  hypergeometricAtLeast,
  landDropConsistencyByTurn,
} from './index';

describe('probability-engine', () => {
  it('computes combinations', () => {
    expect(combination(5, 2)).toBe(10);
  });

  it('computes at least probability', () => {
    expect(hypergeometricAtLeast(60, 24, 9, 3)).toBeGreaterThan(0.7);
  });

  it('computes land drop consistency', () => {
    const p = landDropConsistencyByTurn(24, 4, true);
    expect(p).toBeGreaterThan(0.6);
  });

  it('finds minimum sources for a target', () => {
    const sources = findMinimumColoredSources(2, 1, 0.85, 24, true);
    expect(sources).toBeGreaterThanOrEqual(12);
  });
});

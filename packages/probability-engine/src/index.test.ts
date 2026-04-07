import { describe, expect, it } from 'vitest';
import {
  cardsSeenByTurn,
  combination,
  coloredSourcesByTurnProbability,
  findMinimumColoredSources,
  hypergeometricAtLeast,
  hypergeometricPmf,
  landHitProbabilityByTurn,
  probabilityAtLeastColoredSourcesByTurn,
  probabilityAtLeastLandsByTurn,
  untappedColoredSourcesByTurnProbability,
} from './index';

describe('probability-engine', () => {
  it('computes combinations deterministically', () => {
    expect(combination(5, 2)).toBe(10);
    expect(combination(10, 0)).toBe(1);
  });

  it('computes hypergeometric pmf with deterministic expected value', () => {
    expect(hypergeometricPmf(20, 7, 5, 2)).toBeCloseTo(0.38738390092879255, 12);
  });

  it('computes hypergeometric at least with deterministic expected value', () => {
    expect(hypergeometricAtLeast(60, 24, 9, 3)).toBeCloseTo(0.7886544700367519, 12);
  });

  it('computes cards seen by turn correctly for play and draw', () => {
    expect(cardsSeenByTurn(4, 'play')).toBe(10);
    expect(cardsSeenByTurn(4, 'draw')).toBe(11);
  });

  it('computes land hit probability by turn for play and draw', () => {
    const play = landHitProbabilityByTurn(60, 24, 4, 4, 'play');
    const draw = landHitProbabilityByTurn(60, 24, 4, 4, 'draw');

    expect(play).toBeCloseTo(0.6317853730297426, 12);
    expect(draw).toBeCloseTo(0.7259068312339482, 12);
    expect(draw).toBeGreaterThan(play);
  });

  it('computes colored source probability with deterministic expected value', () => {
    const p = coloredSourcesByTurnProbability(60, 24, 14, 2, 3, 'play');
    expect(p).toBeCloseTo(0.6269795437393147, 12);
  });

  it('provides framework-agnostic aliases for land and colored source probabilities', () => {
    expect(probabilityAtLeastLandsByTurn(60, 24, 4, 4, 'play')).toBeCloseTo(0.6317853730297426, 12);
    expect(probabilityAtLeastColoredSourcesByTurn(60, 24, 14, 2, 3, 'play')).toBeCloseTo(
      0.6269795437393147,
      12,
    );
  });

  it('computes untapped colored source probability deterministically', () => {
    const p = untappedColoredSourcesByTurnProbability(60, 24, 14, 2, 3, 'draw');
    expect(p).toBeCloseTo(0.7048298028445453, 12);
  });

  it('finds minimum colored sources for a target probability', () => {
    const sources = findMinimumColoredSources(60, 3, 2, 0.7, 24, 'play');
    expect(sources).toBe(17);
  });
});

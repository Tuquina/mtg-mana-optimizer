import { describe, expect, it } from 'vitest';
import type { DeckCard } from '@mtg-mana-optimizer/domain';
import {
  buildColoredSourceRecommendation,
  buildLandCountRecommendation,
  buildManaCurveAnalysis,
  buildOptimizationSuggestions,
} from './index';
import { sampleColoredSourceAnalysisOptions } from '@mtg-mana-optimizer/shared';

const sampleCards: DeckCard[] = [
  {
    name: 'Big Spell',
    manaCost: '{6}{R}',
    manaValue: 7,
    colors: ['R'],
    colorPipRequirements: { R: 1 },
    cardTypes: ['Sorcery'],
    quantity: 4,
    expectedCastTurn: 7,
    expectedCastBucket: 6,
  },
  {
    name: 'Mountain',
    manaCost: '',
    manaValue: 0,
    colors: ['R'],
    colorPipRequirements: {},
    cardTypes: ['Land'],
    quantity: 24,
    expectedCastTurn: 0,
    expectedCastBucket: 0,
  },
];

describe('optimizer-engine', () => {
  it('returns structured mana curve analysis', () => {
    const result = buildManaCurveAnalysis(sampleCards);
    expect(result.byManaValue.length).toBeGreaterThan(0);
    expect(result.explanation.summary.length).toBeGreaterThan(5);
  });

  it('returns land recommendation with probabilities', () => {
    const result = buildLandCountRecommendation(sampleCards);
    expect(result.recommendedLandCount).toBeGreaterThan(20);
    expect(result.probabilities).toHaveLength(3);
  });

  it('returns colored source recommendation with explanation', () => {
    const landRecommendation = buildLandCountRecommendation(sampleCards);
    const result = buildColoredSourceRecommendation(
      sampleCards,
      landRecommendation.recommendedLandCount,
      sampleColoredSourceAnalysisOptions,
    );
    expect(result.targets.length).toBe(1);
    expect(result.targets[0]?.color).toBe('R');
    expect(result.consistency[0]?.requirement.mode).toBe('both');
    expect(result.untappedSourceRequirements[0]?.minimumUntappedSources).toBeGreaterThanOrEqual(1);
  });

  it('returns optimization warnings and suggestions', () => {
    const result = buildOptimizationSuggestions(sampleCards);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from 'vitest';
import type { DeckCard } from '@mtg-mana-optimizer/domain';
import {
  analyzeManaCurve,
  buildPlayPatternCurve,
  buildRulesBasedCurve,
  calculateAverageNonLandManaValue,
  detectCurveGaps,
  detectCurvePeak,
  filterNonLandCards,
  groupCurveBuckets,
  parseManaCost,
} from './index';

const sampleCards: DeckCard[] = [
  {
    name: 'One Drop',
    manaCost: '{R}',
    manaValue: 1,
    colors: ['R'],
    colorPipRequirements: { R: 1 },
    cardTypes: ['Creature'],
    quantity: 4,
    expectedCastTurn: 1,
    expectedCastBucket: 1,
  },
  {
    name: 'Two Drop',
    manaCost: '{1}{R}',
    manaValue: 2,
    colors: ['R'],
    colorPipRequirements: { R: 1 },
    cardTypes: ['Creature'],
    quantity: 3,
    expectedCastTurn: 2,
    expectedCastBucket: 2,
  },
  {
    name: 'Top End',
    manaCost: '{5}{R}{R}',
    manaValue: 7,
    colors: ['R'],
    colorPipRequirements: { R: 2 },
    cardTypes: ['Sorcery'],
    quantity: 2,
    expectedCastTurn: 6,
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

describe('mana-curve-engine calculations', () => {
  it('calculates mana value and pip requirements from mana cost', () => {
    const parsed = parseManaCost('{2}{R}{R/W}');
    expect(parsed.manaValue).toBe(4);
    expect(parsed.pipRequirements).toEqual(
      expect.arrayContaining([
        { color: 'R', count: 2 },
        { color: 'W', count: 1 },
      ]),
    );
  });

  it('filters nonland cards', () => {
    const nonlands = filterNonLandCards(sampleCards);
    expect(nonlands).toHaveLength(3);
  });

  it('groups cards into ordered buckets', () => {
    const buckets = groupCurveBuckets(filterNonLandCards(sampleCards), (card) => card.manaValue);
    expect(buckets.map((bucket) => bucket.bucket)).toEqual(['1', '2', '3', '4', '5', '6+']);
    expect(buckets.find((bucket) => bucket.bucket === '1')?.count).toBe(4);
    expect(buckets.find((bucket) => bucket.bucket === '6+')?.count).toBe(2);
  });

  it('calculates average nonland mana value', () => {
    const average = calculateAverageNonLandManaValue(filterNonLandCards(sampleCards));
    expect(average).toBeCloseTo((4 * 1 + 3 * 2 + 2 * 7) / 9, 5);
  });

  it('detects curve peak and interior gaps', () => {
    const buckets = [
      { bucket: '1', count: 4 },
      { bucket: '2', count: 0 },
      { bucket: '3', count: 3 },
      { bucket: '4', count: 0 },
      { bucket: '5', count: 1 },
      { bucket: '6+', count: 0 },
    ] as const;

    expect(detectCurvePeak([...buckets])).toBe('1');
    expect(detectCurveGaps([...buckets])).toEqual(['2', '4']);
  });

  it('builds rules-based and play-pattern analyses', () => {
    const nonlands = filterNonLandCards(sampleCards);
    const rules = buildRulesBasedCurve(nonlands);
    const playPattern = buildPlayPatternCurve(nonlands);

    expect(rules.peakBucket).toBe('1');
    expect(playPattern.buckets.find((bucket) => bucket.bucket === '6+')?.count).toBe(2);
  });

  it('returns full mana curve analysis aggregate', () => {
    const analysis = analyzeManaCurve(sampleCards);

    expect(analysis.nonLandCardCount).toBe(9);
    expect(analysis.rulesBased.buckets.find((bucket) => bucket.bucket === '1')?.count).toBe(4);
    expect(analysis.playPattern.buckets.find((bucket) => bucket.bucket === '2')?.count).toBe(3);
  });
});

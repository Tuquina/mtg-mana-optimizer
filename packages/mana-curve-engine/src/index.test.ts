import { describe, expect, it } from 'vitest';
import { analyzeManaCurve } from './index';

describe('analyzeManaCurve', () => {
  it('builds curve histogram and average nonland mana value', () => {
    const analysis = analyzeManaCurve([
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
        name: 'Big Spell',
        manaCost: '{5}{R}',
        manaValue: 6,
        colors: ['R'],
        colorPipRequirements: { R: 1 },
        cardTypes: ['Sorcery'],
        quantity: 2,
        expectedCastTurn: 6,
        expectedCastBucket: 6,
      },
    ]);

    expect(analysis.histogram['1']).toBe(4);
    expect(analysis.histogram['6+']).toBe(2);
    expect(analysis.averageManaValueNonLands).toBeCloseTo(2.666, 2);
  });
});

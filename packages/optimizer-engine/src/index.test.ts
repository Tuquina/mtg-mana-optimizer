import { describe, expect, it } from 'vitest';
import { recommendDeckAdjustments } from './index';

describe('recommendDeckAdjustments', () => {
  it('returns land recommendation and flags', () => {
    const result = recommendDeckAdjustments([
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
    ]);

    expect(result.recommendedLandCount).toBeGreaterThan(20);
    expect(result.flags.length).toBeGreaterThan(0);
  });
});

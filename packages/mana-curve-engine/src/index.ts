import type { DeckCard } from '@mtg-mana-optimizer/domain';

export interface ManaCurveAnalysis {
  histogram: Record<string, number>;
  playPatternCurve: Record<string, number>;
  averageManaValueNonLands: number;
}

/** Calculate rules-based and play-pattern mana curves. */
export const analyzeManaCurve = (cards: DeckCard[]): ManaCurveAnalysis => {
  const nonLands = cards.filter((c) => !c.cardTypes.includes('Land'));
  const histogram: Record<string, number> = {};
  const playPatternCurve: Record<string, number> = {};

  for (const card of nonLands) {
    const mvBucket = card.manaValue >= 6 ? '6+' : String(card.manaValue);
    const castBucket = card.expectedCastBucket >= 6 ? '6+' : String(card.expectedCastBucket);

    histogram[mvBucket] = (histogram[mvBucket] ?? 0) + card.quantity;
    playPatternCurve[castBucket] = (playPatternCurve[castBucket] ?? 0) + card.quantity;
  }

  const weightedMv = nonLands.reduce((acc, card) => acc + card.manaValue * card.quantity, 0);
  const totalNonLands = nonLands.reduce((acc, card) => acc + card.quantity, 0);

  return {
    histogram,
    playPatternCurve,
    averageManaValueNonLands: totalNonLands === 0 ? 0 : weightedMv / totalNonLands,
  };
};

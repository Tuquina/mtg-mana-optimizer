import type { DeckCard } from '@mtg-mana-optimizer/domain';
import { analyzeManaCurve } from '@mtg-mana-optimizer/mana-curve-engine';
import { findMinimumColoredSources } from '@mtg-mana-optimizer/probability-engine';

export interface Recommendation {
  recommendedLandCount: number;
  colorSourceTargets: Record<string, number>;
  flags: string[];
  deckAdjustments: Array<{ action: 'cut' | 'add'; reason: string; count: number; bucket: string }>;
}

/** First-pass recommendation engine with transparent heuristics. */
export const recommendDeckAdjustments = (cards: DeckCard[]): Recommendation => {
  const curve = analyzeManaCurve(cards);
  const averageMv = curve.averageManaValueNonLands;
  const recommendedLandCount = Math.round(16 + 3.14 * averageMv);

  const flags: string[] = [];
  const topHeavy = (curve.histogram['6+'] ?? 0) >= 4;
  if (topHeavy) flags.push('Top-heavy curve detected (4+ spells in 6+ bucket).');

  const earlyDensity = (curve.playPatternCurve['1'] ?? 0) + (curve.playPatternCurve['2'] ?? 0);
  if (earlyDensity < 12) flags.push('Low early-game density in expected cast buckets 1-2.');

  const redPipCards = cards.filter((card) => (card.colorPipRequirements.R ?? 0) > 0);
  const colorSourceTargets: Record<string, number> = {};
  if (redPipCards.length > 0) {
    colorSourceTargets.R = findMinimumColoredSources(2, 1, 0.85, recommendedLandCount, true);
  }

  const deckAdjustments: Recommendation['deckAdjustments'] = [];
  if (topHeavy) {
    deckAdjustments.push({
      action: 'cut',
      reason: 'Reduce top-end to improve early consistency.',
      count: 2,
      bucket: '6+',
    });
    deckAdjustments.push({
      action: 'add',
      reason: 'Increase turn-2 play density.',
      count: 2,
      bucket: '2',
    });
  }

  return {
    recommendedLandCount,
    colorSourceTargets,
    flags,
    deckAdjustments,
  };
};

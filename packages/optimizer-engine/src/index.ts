import type {
  ColoredSourceRecommendationDto,
  DeckCard,
  DeckWarningDto,
  LandCountRecommendationDto,
  ManaColor,
  ManaCurveAnalysisDto,
  OptimizationSuggestionsDto,
} from '@mtg-mana-optimizer/domain';
import { analyzeManaCurve } from '@mtg-mana-optimizer/mana-curve-engine';
import {
  coloredSourcesByTurnProbability,
  findMinimumColoredSources,
  landHitProbabilityByTurn,
} from '@mtg-mana-optimizer/probability-engine';

const DECK_SIZE = 60;

const toBuckets = (histogram: Record<string, number>) =>
  Object.entries(histogram)
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));

export const buildManaCurveAnalysis = (cards: DeckCard[]): ManaCurveAnalysisDto => {
  const curve = analyzeManaCurve(cards);
  const earlyDensity = (curve.playPatternCurve['1'] ?? 0) + (curve.playPatternCurve['2'] ?? 0);

  return {
    byManaValue: toBuckets(curve.histogram),
    byExpectedCast: toBuckets(curve.playPatternCurve),
    averageManaValueNonLands: curve.averageManaValueNonLands,
    explanation: {
      summary: 'Mana curve computed from rules mana value and expected cast buckets.',
      details: [
        `Average mana value for non-lands is ${curve.averageManaValueNonLands.toFixed(2)}.`,
        `Early expected-cast density (turns 1-2) is ${earlyDensity} cards.`,
      ],
    },
  };
};

export const buildLandCountRecommendation = (cards: DeckCard[]): LandCountRecommendationDto => {
  const curve = analyzeManaCurve(cards);
  const recommendedLandCount = Math.round(16 + 3.14 * curve.averageManaValueNonLands);

  const probabilities = [3, 4, 5].map((turn) => ({
    turn,
    onPlay: landHitProbabilityByTurn(DECK_SIZE, recommendedLandCount, turn, turn, 'play'),
    onDraw: landHitProbabilityByTurn(DECK_SIZE, recommendedLandCount, turn, turn, 'draw'),
  }));

  return {
    recommendedLandCount,
    probabilities,
    explanation: {
      summary: 'Land recommendation uses CMC-regression baseline and hypergeometric land-drop hit rates.',
      details: [
        `Baseline formula: round(16 + 3.14 * avgMV) => ${recommendedLandCount}.`,
        'Probabilities represent hitting exact turn land drops by turns 3/4/5 on play and draw.',
      ],
    },
  };
};

export const buildColoredSourceRecommendation = (
  cards: DeckCard[],
  recommendedLandCount: number,
): ColoredSourceRecommendationDto => {
  const colors = new Set<ManaColor>();
  for (const card of cards) {
    for (const color of card.colors) colors.add(color);
  }

  const targets = [...colors].map((color) => {
    const requiredPips = Math.max(
      1,
      ...cards.filter((c) => !c.cardTypes.includes('Land')).map((c) => c.colorPipRequirements[color] ?? 0),
    );
    const turn = requiredPips >= 2 ? 3 : 2;
    const targetProbability = requiredPips >= 2 ? 0.7 : 0.85;
    const recommendedSources = findMinimumColoredSources(
      DECK_SIZE,
      turn,
      requiredPips,
      targetProbability,
      recommendedLandCount,
      'play',
    );

    return {
      color,
      requiredPips,
      turn,
      targetProbability,
      recommendedSources,
      probabilityOnPlay: coloredSourcesByTurnProbability(
        DECK_SIZE,
        recommendedLandCount,
        recommendedSources,
        requiredPips,
        turn,
        'play',
      ),
      probabilityOnDraw: coloredSourcesByTurnProbability(
        DECK_SIZE,
        recommendedLandCount,
        recommendedSources,
        requiredPips,
        turn,
        'draw',
      ),
    };
  });

  return {
    targets,
    explanation: {
      summary: 'Colored source targets are solved with conditional hypergeometric composition.',
      details: [
        'For each color, we solve the minimum number of sources required to meet probability threshold on the play.',
        'Reported play/draw probabilities include both land-count and colored-source constraints.',
      ],
    },
  };
};

export const buildOptimizationSuggestions = (cards: DeckCard[]): OptimizationSuggestionsDto => {
  const curve = analyzeManaCurve(cards);
  const warnings: DeckWarningDto[] = [];
  const suggestions: OptimizationSuggestionsDto['suggestions'] = [];

  const topHeavy = (curve.histogram['6+'] ?? 0) >= 4;
  if (topHeavy) {
    warnings.push({
      code: 'TOP_HEAVY_CURVE',
      message: 'Top-heavy curve detected (4+ spells in 6+ bucket).',
      explanation: 'Too many high-cost spells lower early curve-out consistency.',
    });
    suggestions.push({
      action: 'cut',
      bucket: '6+',
      count: 2,
      reason: 'Reduce top-end to improve early consistency.',
      explanation: 'This lowers dead opening hands and improves turn-2 to turn-4 sequencing.',
    });
    suggestions.push({
      action: 'add',
      bucket: '2',
      count: 2,
      reason: 'Increase turn-2 play density.',
      explanation: 'Two-drops improve expected mana usage in early turns.',
    });
  }

  const earlyDensity = (curve.playPatternCurve['1'] ?? 0) + (curve.playPatternCurve['2'] ?? 0);
  if (earlyDensity < 12) {
    warnings.push({
      code: 'LOW_EARLY_DENSITY',
      message: 'Low early-game density in expected cast buckets 1-2.',
      explanation: 'Early gaps increase mana waste and missed pressure windows.',
    });
  }

  return {
    warnings,
    suggestions,
    explanation: {
      summary: 'Warnings and suggestions are generated from curve-shape and play-pattern heuristics.',
      details: [
        `Detected ${warnings.length} warnings and ${suggestions.length} actionable suggestions.`,
      ],
    },
  };
};

import type {
  ColoredSourceAnalysisOptions,
  ColorConsistencyResult,
  ColorSourceRequirement,
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
  untappedColoredSourcesByTurnProbability,
} from '@mtg-mana-optimizer/probability-engine';

const DECK_SIZE = 60;

const toBuckets = (buckets: { bucket: string; count: number }[]) => buckets;

/** Build API DTO for mana curve analysis using the domain mana-curve aggregate. */
export const buildManaCurveAnalysis = (cards: DeckCard[]): ManaCurveAnalysisDto => {
  const curve = analyzeManaCurve(cards);
  const earlyDensity =
    (curve.playPattern.buckets.find((bucket) => bucket.bucket === '1')?.count ?? 0) +
    (curve.playPattern.buckets.find((bucket) => bucket.bucket === '2')?.count ?? 0);

  return {
    byManaValue: toBuckets(curve.rulesBased.buckets),
    byExpectedCast: toBuckets(curve.playPattern.buckets),
    averageManaValueNonLands: curve.averageNonLandManaValue,
    nonLandCardCount: curve.nonLandCardCount,
    manaValuePeakBucket: curve.rulesBased.peakBucket,
    manaValueGapBuckets: curve.rulesBased.gapBuckets,
    expectedCastPeakBucket: curve.playPattern.peakBucket,
    expectedCastGapBuckets: curve.playPattern.gapBuckets,
    explanation: {
      summary: 'Mana curve computed from rules mana value and expected cast buckets.',
      details: [
        `Average mana value for non-lands is ${curve.averageNonLandManaValue.toFixed(2)}.`,
        `Early expected-cast density (turns 1-2) is ${earlyDensity} cards.`,
      ],
    },
  };
};

export const buildLandCountRecommendation = (cards: DeckCard[]): LandCountRecommendationDto => {
  const curve = analyzeManaCurve(cards);
  const recommendedLandCount = Math.round(16 + 3.14 * curve.averageNonLandManaValue);

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
  options: ColoredSourceAnalysisOptions = {},
): ColoredSourceRecommendationDto => {
  const mode = options.mode ?? 'both';
  const defaultThreshold = options.targetProbability ?? 0.8;
  const minimumUntappedByTurn = options.minimumUntappedByTurn ?? {};

  const colors = new Set<ManaColor>();
  for (const card of cards) {
    for (const color of card.colors) colors.add(color);
  }

  const requirements: ColoredSourceRecommendationDto['requirements'] = [];
  const consistency: ColorConsistencyResult[] = [];
  const untappedSourceRequirements: ColorSourceRequirement[] = [];

  const targets = [...colors].map((color) => {
    const requiredPips = Math.max(
      1,
      ...cards.filter((c) => !c.cardTypes.includes('Land')).map((c) => c.colorPipRequirements[color] ?? 0),
    );
    const turn = requiredPips >= 2 ? 3 : 2;
    const targetProbability =
      options.perColorThresholds?.[color] ??
      (requiredPips >= 2 ? defaultThreshold : Math.max(defaultThreshold, 0.85));
    const minimumUntappedSources = Math.max(requiredPips, minimumUntappedByTurn[turn] ?? 0);
    const recommendedSources = findMinimumColoredSources(
      DECK_SIZE,
      turn,
      requiredPips,
      targetProbability,
      recommendedLandCount,
      mode === 'draw' ? 'draw' : 'play',
    );

    const requirement = {
      turn,
      mode,
      minimumLands: turn,
      targetProbability,
      colorRequirements: [{ color, requiredSources: requiredPips, minimumUntappedSources }],
    };
    requirements.push(requirement);

    const probabilityOnPlay = coloredSourcesByTurnProbability(
      DECK_SIZE,
      recommendedLandCount,
      recommendedSources,
      requiredPips,
      turn,
      'play',
    );
    const probabilityOnDraw = coloredSourcesByTurnProbability(
      DECK_SIZE,
      recommendedLandCount,
      recommendedSources,
      requiredPips,
      turn,
      'draw',
    );
    const untappedOnPlay = untappedColoredSourcesByTurnProbability(
      DECK_SIZE,
      recommendedLandCount,
      recommendedSources,
      minimumUntappedSources,
      turn,
      'play',
    );
    const untappedOnDraw = untappedColoredSourcesByTurnProbability(
      DECK_SIZE,
      recommendedLandCount,
      recommendedSources,
      minimumUntappedSources,
      turn,
      'draw',
    );

    untappedSourceRequirements.push({ color, requiredSources: requiredPips, minimumUntappedSources });
    consistency.push({
      requirement,
      probabilityOnPlay,
      probabilityOnDraw,
      meetsThresholdOnPlay: probabilityOnPlay >= targetProbability && untappedOnPlay >= targetProbability,
      meetsThresholdOnDraw: probabilityOnDraw >= targetProbability && untappedOnDraw >= targetProbability,
    });

    return {
      color,
      requiredPips,
      turn,
      targetProbability,
      recommendedSources,
      probabilityOnPlay,
      probabilityOnDraw,
    };
  });

  return {
    targets,
    requirements,
    consistency,
    untappedSourceRequirements,
    explanation: {
      summary: 'Colored source targets are solved with conditional hypergeometric composition.',
      details: [
        'For each color, we solve minimum sources required to satisfy configurable probability thresholds.',
        'Reported play/draw consistency also checks minimum untapped colored sources for early turns.',
      ],
    },
  };
};

export const buildOptimizationSuggestions = (cards: DeckCard[]): OptimizationSuggestionsDto => {
  const curve = analyzeManaCurve(cards);
  const warnings: DeckWarningDto[] = [];
  const suggestions: OptimizationSuggestionsDto['suggestions'] = [];

  const topHeavy = (curve.rulesBased.buckets.find((bucket) => bucket.bucket === '6+')?.count ?? 0) >= 4;
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

  const earlyDensity =
    (curve.playPattern.buckets.find((bucket) => bucket.bucket === '1')?.count ?? 0) +
    (curve.playPattern.buckets.find((bucket) => bucket.bucket === '2')?.count ?? 0);
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
      details: [`Detected ${warnings.length} warnings and ${suggestions.length} actionable suggestions.`],
    },
  };
};

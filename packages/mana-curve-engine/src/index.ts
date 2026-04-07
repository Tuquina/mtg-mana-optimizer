import type {
  CurveBucket,
  CurveBucketLabel,
  DeckCard,
  ManaCost,
  ManaCurveAnalysis,
  ManaPipRequirement,
  PlayPatternCurveAnalysis,
  RulesBasedCurveAnalysis,
} from '@mtg-mana-optimizer/domain';

const ORDERED_BUCKETS: CurveBucketLabel[] = ['1', '2', '3', '4', '5', '6+'];
const COLOR_SYMBOLS = new Set(['W', 'U', 'B', 'R', 'G'] as const);

const isManaColor = (value: string): value is 'W' | 'U' | 'B' | 'R' | 'G' =>
  COLOR_SYMBOLS.has(value as (typeof COLOR_SYMBOLS extends Set<infer T> ? T : never));

/** Parse a mana cost string into a value object containing mana value and pip requirements. */
export const parseManaCost = (manaCost: string): ManaCost => {
  const pipAccumulator = new Map<ManaPipRequirement['color'], number>();
  let manaValue = 0;

  const tokens = manaCost.match(/\{([^}]+)\}/g) ?? [];
  for (const token of tokens) {
    const symbol = token.slice(1, -1).toUpperCase();

    if (/^\d+$/.test(symbol)) {
      manaValue += Number(symbol);
      continue;
    }

    const splitSymbols = symbol.split('/');
    const hasColorSymbol = splitSymbols.some((part) => isManaColor(part));

    if (hasColorSymbol) {
      manaValue += 1;
    }

    for (const part of splitSymbols) {
      if (isManaColor(part)) {
        pipAccumulator.set(part, (pipAccumulator.get(part) ?? 0) + 1);
      }
    }
  }

  return {
    raw: manaCost,
    manaValue,
    pipRequirements: [...pipAccumulator.entries()].map(([color, count]) => ({ color, count })),
  };
};

/** Return only nonland cards from a deck list. */
export const filterNonLandCards = (cards: DeckCard[]): DeckCard[] =>
  cards.filter((card) => !card.cardTypes.includes('Land'));

const toBucketLabel = (value: number): CurveBucketLabel => {
  if (value <= 1) return '1';
  if (value === 2) return '2';
  if (value === 3) return '3';
  if (value === 4) return '4';
  if (value === 5) return '5';
  return '6+';
};

/** Group card quantities into ordered curve buckets using a projection strategy. */
export const groupCurveBuckets = (
  cards: DeckCard[],
  projector: (card: DeckCard) => number,
): CurveBucket[] => {
  const totals: Record<CurveBucketLabel, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6+': 0,
  };

  for (const card of cards) {
    const bucket = toBucketLabel(projector(card));
    totals[bucket] += card.quantity;
  }

  return ORDERED_BUCKETS.map((bucket) => ({ bucket, count: totals[bucket] }));
};

/** Calculate quantity-weighted average mana value for nonland cards. */
export const calculateAverageNonLandManaValue = (cards: DeckCard[]): number => {
  const weightedManaValue = cards.reduce((acc, card) => {
    const calculatedManaValue = parseManaCost(card.manaCost).manaValue;
    const effectiveManaValue = calculatedManaValue > 0 ? calculatedManaValue : card.manaValue;
    return acc + effectiveManaValue * card.quantity;
  }, 0);
  const totalCount = cards.reduce((acc, card) => acc + card.quantity, 0);

  return totalCount === 0 ? 0 : weightedManaValue / totalCount;
};

/** Detect the bucket with the highest count. Returns null when all buckets are empty. */
export const detectCurvePeak = (buckets: CurveBucket[]): CurveBucketLabel | null => {
  const peak = buckets.reduce<CurveBucket | null>((best, bucket) => {
    if (!best || bucket.count > best.count) return bucket;
    return best;
  }, null);

  return !peak || peak.count === 0 ? null : peak.bucket;
};

/** Detect empty buckets between the first and last non-empty buckets. */
export const detectCurveGaps = (buckets: CurveBucket[]): CurveBucketLabel[] => {
  const nonEmptyIndexes = buckets
    .map((bucket, index) => ({ bucket, index }))
    .filter((entry) => entry.bucket.count > 0)
    .map((entry) => entry.index);

  if (nonEmptyIndexes.length < 2) return [];

  const first = nonEmptyIndexes[0] ?? 0;
  const last = nonEmptyIndexes[nonEmptyIndexes.length - 1] ?? 0;

  return buckets
    .slice(first, last + 1)
    .filter((bucket) => bucket.count === 0)
    .map((bucket) => bucket.bucket);
};

/** Build rules-based mana-value curve analysis. */
export const buildRulesBasedCurve = (nonLandCards: DeckCard[]): RulesBasedCurveAnalysis => {
  const buckets = groupCurveBuckets(nonLandCards, (card) => {
    const parsed = parseManaCost(card.manaCost);
    return parsed.manaValue > 0 ? parsed.manaValue : card.manaValue;
  });

  return {
    buckets,
    peakBucket: detectCurvePeak(buckets),
    gapBuckets: detectCurveGaps(buckets),
  };
};

/** Build play-pattern curve analysis using expected cast bucket metadata. */
export const buildPlayPatternCurve = (nonLandCards: DeckCard[]): PlayPatternCurveAnalysis => {
  const buckets = groupCurveBuckets(nonLandCards, (card) => card.expectedCastBucket);

  return {
    buckets,
    peakBucket: detectCurvePeak(buckets),
    gapBuckets: detectCurveGaps(buckets),
  };
};

/** Calculate the full mana-curve analysis aggregate for a deck list. */
export const analyzeManaCurve = (cards: DeckCard[]): ManaCurveAnalysis => {
  const nonLandCards = filterNonLandCards(cards);

  return {
    rulesBased: buildRulesBasedCurve(nonLandCards),
    playPattern: buildPlayPatternCurve(nonLandCards),
    averageNonLandManaValue: calculateAverageNonLandManaValue(nonLandCards),
    nonLandCardCount: nonLandCards.reduce((acc, card) => acc + card.quantity, 0),
  };
};

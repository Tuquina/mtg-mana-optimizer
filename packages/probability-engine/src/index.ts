export type PlayDraw = 'play' | 'draw';

const EPSILON = 1e-12;

/** Compute n choose k. */
export const combination = (n: number, k: number): number => {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) return 0;
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  const r = Math.min(k, n - k);
  let numerator = 1;
  let denominator = 1;
  for (let i = 1; i <= r; i += 1) {
    numerator *= n - (r - i);
    denominator *= i;
  }

  return numerator / denominator;
};

/** Hypergeometric PMF for exactly k successes in n draws. */
export const hypergeometricPmf = (
  populationSize: number,
  successStates: number,
  draws: number,
  observedSuccesses: number,
): number => {
  if (populationSize <= 0 || draws < 0 || draws > populationSize) return 0;
  if (successStates < 0 || successStates > populationSize) return 0;
  if (observedSuccesses < 0 || observedSuccesses > draws) return 0;

  const numerator =
    combination(successStates, observedSuccesses) *
    combination(populationSize - successStates, draws - observedSuccesses);
  const denominator = combination(populationSize, draws);

  return denominator === 0 ? 0 : numerator / denominator;
};

/** Probability of at least minimum successes. */
export const hypergeometricAtLeast = (
  populationSize: number,
  successStates: number,
  draws: number,
  minimumSuccesses: number,
): number => {
  if (minimumSuccesses <= 0) return 1;

  let sum = 0;
  for (let k = minimumSuccesses; k <= draws; k += 1) {
    sum += hypergeometricPmf(populationSize, successStates, draws, k);
  }

  return Math.max(0, Math.min(1, sum));
};

/** Number of cards seen by the start of turn T (inclusive draw step). */
export const cardsSeenByTurn = (turn: number, mode: PlayDraw): number => {
  if (turn < 1) return 0;
  return mode === 'play' ? 7 + (turn - 1) : 7 + turn;
};

/** Probability of having at least N lands by turn T. */
export const landHitProbabilityByTurn = (
  deckSize: number,
  landCount: number,
  minimumLands: number,
  turn: number,
  mode: PlayDraw,
): number => {
  const draws = cardsSeenByTurn(turn, mode);
  return hypergeometricAtLeast(deckSize, landCount, draws, minimumLands);
};

/**
 * Probability of having at least P colored sources by turn T,
 * while also having at least T lands to make natural land drops.
 */
export const coloredSourcesByTurnProbability = (
  deckSize: number,
  landCount: number,
  coloredSourceCount: number,
  requiredSources: number,
  turn: number,
  mode: PlayDraw,
): number => {
  const cardsSeen = cardsSeenByTurn(turn, mode);
  const minLandsNeeded = turn;
  let probability = 0;

  for (let landsDrawn = minLandsNeeded; landsDrawn <= cardsSeen; landsDrawn += 1) {
    const pLandsDrawn = hypergeometricPmf(deckSize, landCount, cardsSeen, landsDrawn);
    const pColoredGivenLands = hypergeometricAtLeast(
      landCount,
      coloredSourceCount,
      landsDrawn,
      requiredSources,
    );
    probability += pLandsDrawn * pColoredGivenLands;
  }

  return Math.abs(probability) < EPSILON ? 0 : Math.max(0, Math.min(1, probability));
};

/** Minimum colored sources needed to meet a turn consistency target. */
export const findMinimumColoredSources = (
  deckSize: number,
  turn: number,
  requiredPips: number,
  targetProbability: number,
  landCount: number,
  mode: PlayDraw,
): number => {
  for (let sourceCount = requiredPips; sourceCount <= landCount; sourceCount += 1) {
    const probability = coloredSourcesByTurnProbability(
      deckSize,
      landCount,
      sourceCount,
      requiredPips,
      turn,
      mode,
    );

    if (probability >= targetProbability) {
      return sourceCount;
    }
  }

  return landCount;
};

/** Compute n choose k. */
export const combination = (n: number, k: number): number => {
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
  let sum = 0;
  for (let k = minimumSuccesses; k <= draws; k += 1) {
    sum += hypergeometricPmf(populationSize, successStates, draws, k);
  }

  return sum;
};

/** Probability of hitting a land drop by a given turn on play/draw. */
export const landDropConsistencyByTurn = (
  landCount: number,
  turn: number,
  onPlay = true,
): number => {
  const cardsSeen = onPlay ? 7 + (turn - 1) : 8 + (turn - 1);
  return hypergeometricAtLeast(60, landCount, cardsSeen, turn);
};

/** Minimum colored sources needed to meet a turn consistency target. */
export const findMinimumColoredSources = (
  turn: number,
  requiredPips: number,
  targetProbability: number,
  landCount: number,
  onPlay = true,
): number => {
  const cardsSeen = onPlay ? 7 + (turn - 1) : 8 + (turn - 1);

  for (let sourceCount = requiredPips; sourceCount <= landCount; sourceCount += 1) {
    let probability = 0;
    for (let landsDrawn = turn; landsDrawn <= cardsSeen; landsDrawn += 1) {
      const landDrawProbability = hypergeometricPmf(60, landCount, cardsSeen, landsDrawn);
      const coloredGivenLands = hypergeometricAtLeast(landCount, sourceCount, landsDrawn, requiredPips);
      probability += landDrawProbability * coloredGivenLands;
    }

    if (probability >= targetProbability) {
      return sourceCount;
    }
  }

  return landCount;
};

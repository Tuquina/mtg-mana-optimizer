import type { ColoredSourceAnalysisOptions } from '@mtg-mana-optimizer/domain';

/** Example deterministic colored source analysis settings used in tests and API docs. */
export const sampleColoredSourceAnalysisOptions: ColoredSourceAnalysisOptions = {
  mode: 'both',
  targetProbability: 0.8,
  perColorThresholds: { R: 0.85, U: 0.78 },
  minimumUntappedByTurn: { 2: 1, 3: 2 },
};

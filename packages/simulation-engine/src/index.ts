import { landDropConsistencyByTurn } from '@mtg-mana-optimizer/probability-engine';

export interface GoldfishSimulationResult {
  turn3LandHit: number;
  turn4LandHit: number;
  turn5LandHit: number;
}

/** Lightweight deterministic baseline before Monte Carlo expansion. */
export const simulateLandDropsBaseline = (landCount: number): GoldfishSimulationResult => ({
  turn3LandHit: landDropConsistencyByTurn(landCount, 3, true),
  turn4LandHit: landDropConsistencyByTurn(landCount, 4, true),
  turn5LandHit: landDropConsistencyByTurn(landCount, 5, true),
});

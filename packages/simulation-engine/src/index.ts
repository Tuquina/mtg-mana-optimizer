import { landHitProbabilityByTurn } from '@mtg-mana-optimizer/probability-engine';

export interface GoldfishSimulationResult {
  turn3LandHit: number;
  turn4LandHit: number;
  turn5LandHit: number;
}

/** Lightweight deterministic baseline before Monte Carlo expansion. */
export const simulateLandDropsBaseline = (landCount: number): GoldfishSimulationResult => ({
  turn3LandHit: landHitProbabilityByTurn(60, landCount, 3, 3, 'play'),
  turn4LandHit: landHitProbabilityByTurn(60, landCount, 4, 4, 'play'),
  turn5LandHit: landHitProbabilityByTurn(60, landCount, 5, 5, 'play'),
});

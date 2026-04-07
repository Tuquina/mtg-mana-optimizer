import type { DeckCard } from '@mtg-mana-optimizer/domain';

export interface DeckAnalysisRequest {
  decklistText: string;
}

export interface CurveBucket {
  bucket: string;
  count: number;
}

export interface DeckAnalysisResponse {
  parsedDeck: DeckCard[];
  manaCurve: CurveBucket[];
  averageManaValueNonLands: number;
  recommendedLandCount: number;
  colorSourceTargets: Record<string, number>;
  recommendations: string[];
}

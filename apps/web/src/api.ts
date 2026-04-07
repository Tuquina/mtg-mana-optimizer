import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';
import { analysisApiClient } from './lib/api-client';

/** Backward-compatible function wrapper around the typed API client. */
export const analyzeDeck = async (payload: DeckAnalysisRequest): Promise<DeckAnalysisResponse> =>
  analysisApiClient.analyzeDeck(payload);

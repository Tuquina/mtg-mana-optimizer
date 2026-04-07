import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';

/** Typed client for backend deck analysis endpoint. */
export const analyzeDeck = async (payload: DeckAnalysisRequest): Promise<DeckAnalysisResponse> => {
  const response = await fetch('http://localhost:3001/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze decklist.');
  }

  return (await response.json()) as DeckAnalysisResponse;
};

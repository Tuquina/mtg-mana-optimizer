import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';

const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Typed API transport layer for deck analysis endpoints. */
export class AnalysisApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async analyzeDeck(payload: DeckAnalysisRequest): Promise<DeckAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      const fallbackMessage = 'Unable to analyze deck. Please verify the decklist and try again.';
      throw new ApiError(body || fallbackMessage, response.status);
    }

    return (await response.json()) as DeckAnalysisResponse;
  }
}

export const analysisApiClient = new AnalysisApiClient();

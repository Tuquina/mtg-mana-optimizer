import { Injectable } from '@nestjs/common';
import { parseDecklist } from '@mtg-mana-optimizer/deck-parser';
import {
  buildColoredSourceRecommendation,
  buildLandCountRecommendation,
  buildManaCurveAnalysis,
  buildOptimizationSuggestions,
} from '@mtg-mana-optimizer/optimizer-engine';
import { validateStandardDeck } from '@mtg-mana-optimizer/domain';
import type {
  ColoredSourceRecommendationResponse,
  DeckAnalysisRequest,
  DeckAnalysisResponse,
  LandCountRecommendationResponse,
  ManaCurveAnalysisResponse,
  OptimizationSuggestionsResponse,
} from '@mtg-mana-optimizer/shared';

@Injectable()
export class AppService {
  private parseAndValidateDeck(decklistText: string) {
    const parsedDeck = parseDecklist(decklistText);
    const validation = validateStandardDeck({ mainDeck: parsedDeck, sideboard: [] });

    if (!validation.valid) {
      throw new Error(validation.errors.join(' | '));
    }

    return parsedDeck;
  }

  analyzeDeck(request: DeckAnalysisRequest): DeckAnalysisResponse {
    const parsedDeck = this.parseAndValidateDeck(request.decklistText);
    const manaCurveAnalysis = buildManaCurveAnalysis(parsedDeck);
    const landCountRecommendation = buildLandCountRecommendation(parsedDeck);
    const coloredSourceRecommendation = buildColoredSourceRecommendation(
      parsedDeck,
      landCountRecommendation.recommendedLandCount,
    );
    const optimization = buildOptimizationSuggestions(parsedDeck);

    return {
      parsedDeck,
      manaCurveAnalysis,
      landCountRecommendation,
      coloredSourceRecommendation,
      optimization,
    };
  }

  analyzeManaCurve(request: DeckAnalysisRequest): ManaCurveAnalysisResponse {
    const parsedDeck = this.parseAndValidateDeck(request.decklistText);
    return {
      parsedDeckSize: parsedDeck.reduce((total, card) => total + card.quantity, 0),
      manaCurveAnalysis: buildManaCurveAnalysis(parsedDeck),
    };
  }

  recommendLandCount(request: DeckAnalysisRequest): LandCountRecommendationResponse {
    const parsedDeck = this.parseAndValidateDeck(request.decklistText);
    return {
      parsedDeckSize: parsedDeck.reduce((total, card) => total + card.quantity, 0),
      landCountRecommendation: buildLandCountRecommendation(parsedDeck),
    };
  }

  recommendColoredSources(request: DeckAnalysisRequest): ColoredSourceRecommendationResponse {
    const parsedDeck = this.parseAndValidateDeck(request.decklistText);
    const landCountRecommendation = buildLandCountRecommendation(parsedDeck);
    return {
      parsedDeckSize: parsedDeck.reduce((total, card) => total + card.quantity, 0),
      coloredSourceRecommendation: buildColoredSourceRecommendation(
        parsedDeck,
        landCountRecommendation.recommendedLandCount,
      ),
    };
  }

  optimizeDeck(request: DeckAnalysisRequest): OptimizationSuggestionsResponse {
    const parsedDeck = this.parseAndValidateDeck(request.decklistText);
    return {
      parsedDeckSize: parsedDeck.reduce((total, card) => total + card.quantity, 0),
      optimization: buildOptimizationSuggestions(parsedDeck),
    };
  }
}

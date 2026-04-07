import { Injectable } from '@nestjs/common';
import { parseDecklist } from '@mtg-mana-optimizer/deck-parser';
import { validateStandardDeck } from '@mtg-mana-optimizer/domain';
import { analyzeManaCurve } from '@mtg-mana-optimizer/mana-curve-engine';
import { recommendDeckAdjustments } from '@mtg-mana-optimizer/optimizer-engine';
import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';

/** Orchestrates parse, validation, analytics, and recommendations. */
@Injectable()
export class AppService {
  analyzeDeck(request: DeckAnalysisRequest): DeckAnalysisResponse {
    const parsedDeck = parseDecklist(request.decklistText);

    const validation = validateStandardDeck({
      mainDeck: parsedDeck,
      sideboard: [],
    });

    if (!validation.valid) {
      throw new Error(validation.errors.join(' | '));
    }

    const curve = analyzeManaCurve(parsedDeck);
    const recommendation = recommendDeckAdjustments(parsedDeck);

    return {
      parsedDeck,
      manaCurve: Object.entries(curve.histogram).map(([bucket, count]) => ({ bucket, count })),
      averageManaValueNonLands: curve.averageManaValueNonLands,
      recommendedLandCount: recommendation.recommendedLandCount,
      colorSourceTargets: recommendation.colorSourceTargets,
      recommendations: [...recommendation.flags, ...recommendation.deckAdjustments.map((r) => `${r.action} ${r.count} from bucket ${r.bucket}: ${r.reason}`)],
    };
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import type {
  ColoredSourceRecommendationResponse,
  DeckAnalysisRequest,
  DeckAnalysisResponse,
  FullCurveAnalysisResponse,
  LandCountRecommendationResponse,
  ManaCurveAnalysisResponse,
  OptimizationSuggestionsResponse,
} from '@mtg-mana-optimizer/shared';
import { AppService } from './app.service';

@Controller('analysis')
export class AppController {
  constructor(private readonly appService: AppService = new AppService()) {}

  @Post()
  analyze(@Body() request: DeckAnalysisRequest): DeckAnalysisResponse {
    return this.appService.analyzeDeck(request);
  }

  /** Single endpoint for mana-curve vertical-slice analysis. */
  @Post('curve-analysis')
  fullCurve(@Body() request: DeckAnalysisRequest): FullCurveAnalysisResponse {
    return this.appService.analyzeFullCurve(request);
  }

  @Post('mana-curve')
  manaCurve(@Body() request: DeckAnalysisRequest): ManaCurveAnalysisResponse {
    return this.appService.analyzeManaCurve(request);
  }

  @Post('land-count')
  landCount(@Body() request: DeckAnalysisRequest): LandCountRecommendationResponse {
    return this.appService.recommendLandCount(request);
  }

  @Post('colored-sources')
  coloredSources(@Body() request: DeckAnalysisRequest): ColoredSourceRecommendationResponse {
    return this.appService.recommendColoredSources(request);
  }

  @Post('optimize')
  optimize(@Body() request: DeckAnalysisRequest): OptimizationSuggestionsResponse {
    return this.appService.optimizeDeck(request);
  }
}

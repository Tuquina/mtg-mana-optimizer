import type {
  ColoredSourceAnalysisOptions,
  ColoredSourceRecommendationDto,
  DeckAnalysisDto,
  LandCountRecommendationDto,
  ManaCurveAnalysisDto,
  OptimizationSuggestionsDto,
} from '@mtg-mana-optimizer/domain';

export interface DeckAnalysisRequest {
  decklistText: string;
  coloredSourceOptions?: ColoredSourceAnalysisOptions;
}

export interface ManaCurveAnalysisResponse {
  parsedDeckSize: number;
  manaCurveAnalysis: ManaCurveAnalysisDto;
}

export interface LandCountRecommendationResponse {
  parsedDeckSize: number;
  landCountRecommendation: LandCountRecommendationDto;
}

export interface ColoredSourceRecommendationResponse {
  parsedDeckSize: number;
  coloredSourceRecommendation: ColoredSourceRecommendationDto;
}

export interface OptimizationSuggestionsResponse {
  parsedDeckSize: number;
  optimization: OptimizationSuggestionsDto;
}

export type DeckAnalysisResponse = DeckAnalysisDto;

/** Response contract for the single vertical-slice endpoint dedicated to mana-curve flow. */
export interface FullCurveAnalysisResponse {
  parsedDeckSize: number;
  manaCurveAnalysis: ManaCurveAnalysisDto;
}

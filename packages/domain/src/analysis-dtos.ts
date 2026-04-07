import type { CurveBucketLabel } from './mana-curve';
import type {
  ColorConsistencyResult,
  ColorSourceRequirement,
  DeckCard,
  ManaColor,
  TurnBasedCastingRequirement,
} from './types';

export interface ExplanationDto {
  summary: string;
  details: string[];
}

export interface CurveBucketDto {
  bucket: string;
  count: number;
}

export interface ManaCurveAnalysisDto {
  byManaValue: CurveBucketDto[];
  byExpectedCast: CurveBucketDto[];
  averageManaValueNonLands: number;
  nonLandCardCount: number;
  manaValuePeakBucket: CurveBucketLabel | null;
  manaValueGapBuckets: CurveBucketLabel[];
  expectedCastPeakBucket: CurveBucketLabel | null;
  expectedCastGapBuckets: CurveBucketLabel[];
  explanation: ExplanationDto;
}

export interface ProbabilityPointDto {
  turn: number;
  onPlay: number;
  onDraw: number;
}

export interface LandCountRecommendationDto {
  recommendedLandCount: number;
  probabilities: ProbabilityPointDto[];
  explanation: ExplanationDto;
}

export interface ColoredSourceTargetDto {
  color: ManaColor;
  requiredPips: number;
  turn: number;
  targetProbability: number;
  recommendedSources: number;
  probabilityOnPlay: number;
  probabilityOnDraw: number;
}

export interface ColoredSourceRecommendationDto {
  targets: ColoredSourceTargetDto[];
  requirements: TurnBasedCastingRequirement[];
  consistency: ColorConsistencyResult[];
  untappedSourceRequirements: ColorSourceRequirement[];
  explanation: ExplanationDto;
}

export interface DeckWarningDto {
  code: 'TOP_HEAVY_CURVE' | 'LOW_EARLY_DENSITY' | 'COLOR_STRESS';
  message: string;
  explanation: string;
}

export interface DeckSuggestionDto {
  action: 'cut' | 'add';
  bucket: string;
  count: number;
  reason: string;
  explanation: string;
}

export interface OptimizationSuggestionsDto {
  warnings: DeckWarningDto[];
  suggestions: DeckSuggestionDto[];
  explanation: ExplanationDto;
}

export interface DeckAnalysisDto {
  parsedDeck: DeckCard[];
  manaCurveAnalysis: ManaCurveAnalysisDto;
  landCountRecommendation: LandCountRecommendationDto;
  coloredSourceRecommendation: ColoredSourceRecommendationDto;
  optimization: OptimizationSuggestionsDto;
}

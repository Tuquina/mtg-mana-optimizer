/** Supported grouped mana curve buckets for this optimizer slice. */
export type CurveBucketLabel = '1' | '2' | '3' | '4' | '5' | '6+';

/** Discrete bucket/count pair used by all curve analyses. */
export interface CurveBucket {
  bucket: CurveBucketLabel;
  count: number;
}

/** Rules-based mana-curve results grouped by mana value. */
export interface RulesBasedCurveAnalysis {
  buckets: CurveBucket[];
  peakBucket: CurveBucketLabel | null;
  gapBuckets: CurveBucketLabel[];
}

/** Play-pattern curve results grouped by expected cast bucket. */
export interface PlayPatternCurveAnalysis {
  buckets: CurveBucket[];
  peakBucket: CurveBucketLabel | null;
  gapBuckets: CurveBucketLabel[];
}

/** Full mana-curve analysis aggregate including summary metrics. */
export interface ManaCurveAnalysis {
  rulesBased: RulesBasedCurveAnalysis;
  playPattern: PlayPatternCurveAnalysis;
  averageNonLandManaValue: number;
  nonLandCardCount: number;
}

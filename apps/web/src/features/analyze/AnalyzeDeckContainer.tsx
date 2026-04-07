'use client';

import { useMemo, useState } from 'react';
import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';
import { sampleStandardDecklist } from '@mtg-mana-optimizer/shared';
import { analysisApiClient } from '../../lib/api-client';
import { validateDecklist } from '../../lib/deck-validation';
import { AnalysisCard } from '../../components/analysis/AnalysisCard';
import { CurveChart } from '../../components/analysis/CurveChart';
import { DeckTextarea } from '../../components/analysis/DeckTextarea';
import { PageSection } from '../../components/analysis/PageSection';
import { RecommendationCard } from '../../components/analysis/RecommendationCard';
import { SourceRequirementTable } from '../../components/analysis/SourceRequirementTable';
import { StatCard } from '../../components/analysis/StatCard';

type Archetype = 'Aggro' | 'Midrange' | 'Control' | 'Combo';
type AnalysisMode = 'play' | 'draw' | 'both';

interface AnalyzeFormState {
  decklistText: string;
  archetype: Archetype;
  mode: AnalysisMode;
  probabilityThreshold: number;
}

const initialFormState: AnalyzeFormState = {
  decklistText: sampleStandardDecklist.trim(),
  archetype: 'Midrange',
  mode: 'both',
  probabilityThreshold: 0.9,
};

function countLands(parsedDeck: DeckAnalysisResponse['parsedDeck']): number {
  return parsedDeck
    .filter((card) => card.cardTypes.includes('Land'))
    .reduce((sum, card) => sum + card.quantity, 0);
}

function collectColors(parsedDeck: DeckAnalysisResponse['parsedDeck']): string {
  const colors = new Set(parsedDeck.flatMap((card) => card.colors));
  return colors.size > 0 ? Array.from(colors).join(', ') : 'Colorless';
}

/** Main analyze flow container: input handling, API call orchestration, and rendering state transitions. */
export function AnalyzeDeckContainer(): JSX.Element {
  const [form, setForm] = useState<AnalyzeFormState>(initialFormState);
  const [result, setResult] = useState<DeckAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const parsedDeckSize = useMemo(
    () => result?.parsedDeck.reduce((sum, card) => sum + card.quantity, 0) ?? 0,
    [result],
  );

  const currentLandCount = useMemo(
    () => (result ? countLands(result.parsedDeck) : 0),
    [result],
  );

  const onAnalyze = async (): Promise<void> => {
    setError(null);

    const validation = validateDecklist(form.decklistText);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);

    const payload: DeckAnalysisRequest = {
      decklistText: form.decklistText,
      coloredSourceOptions: {
        mode: form.mode,
        targetProbability: form.probabilityThreshold,
      },
    };

    setLoading(true);
    try {
      const response = await analysisApiClient.analyzeDeck(payload);
      setResult(response);
    } catch (analysisError) {
      const fallback = 'Analysis failed. Please confirm the API is running and retry.';
      setError(analysisError instanceof Error ? analysisError.message : fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Analyze deck</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
          Paste a Standard decklist and evaluate mana curve, land count, color requirements, and optimization actions.
        </p>
      </header>

      <PageSection title="Deck input" description="Enter decklist and optional tuning parameters.">
        <AnalysisCard>
          <div style={{ display: 'grid', gap: 14 }}>
            <DeckTextarea
              value={form.decklistText}
              disabled={loading}
              onChange={(decklistText) => setForm((prev) => ({ ...prev, decklistText }))}
            />

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Archetype</span>
                <select
                  value={form.archetype}
                  disabled={loading}
                  onChange={(event: { target: { value: string } }) =>
                    setForm((prev) => ({ ...prev, archetype: event.target.value as Archetype }))
                  }
                >
                  <option>Aggro</option>
                  <option>Midrange</option>
                  <option>Control</option>
                  <option>Combo</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Analysis mode</span>
                <select
                  value={form.mode}
                  disabled={loading}
                  onChange={(event: { target: { value: string } }) =>
                    setForm((prev) => ({ ...prev, mode: event.target.value as AnalysisMode }))
                  }
                >
                  <option value="both">Both</option>
                  <option value="play">On the play</option>
                  <option value="draw">On the draw</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Probability threshold</span>
                <input
                  type="number"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={form.probabilityThreshold}
                  disabled={loading}
                  onChange={(event: { target: { value: string } }) =>
                    setForm((prev) => ({ ...prev, probabilityThreshold: Number(event.target.value) || 0.9 }))
                  }
                />
              </label>
            </div>

            <div>
              <button
                type="button"
                disabled={loading}
                onClick={onAnalyze}
                style={{
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Analyzing…' : 'Analyze deck'}
              </button>
            </div>

            {validationErrors.length > 0 ? (
              <div role="alert" style={{ color: 'var(--danger)' }}>
                {validationErrors.join(' ')}
              </div>
            ) : null}

            {error ? (
              <div role="alert" style={{ color: 'var(--danger)' }}>
                {error}{' '}
                <button type="button" onClick={onAnalyze} disabled={loading} style={{ marginLeft: 6 }}>
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        </AnalysisCard>
      </PageSection>

      {!loading && !result && !error ? (
        <PageSection title="Waiting for analysis">
          <AnalysisCard>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Submit a decklist to view deck summary, mana curve histograms, land recommendations, color-source requirements, and optimization suggestions.
            </p>
          </AnalysisCard>
        </PageSection>
      ) : null}

      {result ? (
        <>
          <PageSection title="Deck summary">
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <StatCard label="Total cards" value={parsedDeckSize} />
              <StatCard label="Nonlands" value={result.manaCurveAnalysis.nonLandCardCount} />
              <StatCard label="Lands" value={currentLandCount} />
              <StatCard label="Colors detected" value={collectColors(result.parsedDeck)} />
              <StatCard label="Archetype" value={form.archetype} />
              <StatCard label="Avg mana value" value={result.manaCurveAnalysis.averageManaValueNonLands.toFixed(2)} />
            </div>
          </PageSection>

          <PageSection title="Mana curve analysis">
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              <AnalysisCard>
                <CurveChart title="Rules-based mana curve" data={result.manaCurveAnalysis.byManaValue} />
              </AnalysisCard>
              <AnalysisCard>
                <CurveChart title="Play-pattern curve" data={result.manaCurveAnalysis.byExpectedCast} />
              </AnalysisCard>
              <AnalysisCard>
                <p><strong>Peak (mana value):</strong> {result.manaCurveAnalysis.manaValuePeakBucket ?? 'N/A'}</p>
                <p><strong>Gaps (mana value):</strong> {result.manaCurveAnalysis.manaValueGapBuckets.join(', ') || 'None'}</p>
                <p><strong>Peak (expected cast):</strong> {result.manaCurveAnalysis.expectedCastPeakBucket ?? 'N/A'}</p>
                <p><strong>Gaps (expected cast):</strong> {result.manaCurveAnalysis.expectedCastGapBuckets.join(', ') || 'None'}</p>
                <p style={{ marginBottom: 0, color: 'var(--text-secondary)' }}>{result.manaCurveAnalysis.explanation.summary}</p>
              </AnalysisCard>
            </div>
          </PageSection>

          <PageSection title="Land recommendation">
            <AnalysisCard>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <StatCard label="Recommended lands" value={result.landCountRecommendation.recommendedLandCount} />
                <StatCard label="Current lands" value={currentLandCount} />
                <StatCard
                  label="Delta"
                  value={result.landCountRecommendation.recommendedLandCount - currentLandCount}
                />
              </div>
              <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{result.landCountRecommendation.explanation.summary}</p>
            </AnalysisCard>
          </PageSection>

          <PageSection title="Color source analysis">
            <AnalysisCard>
              <SourceRequirementTable recommendation={result.coloredSourceRecommendation} />
              <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{result.coloredSourceRecommendation.explanation.summary}</p>
            </AnalysisCard>
          </PageSection>

          <PageSection title="Optimization suggestions">
            <div style={{ display: 'grid', gap: 12 }}>
              {result.optimization.warnings.map((warning) => (
                <RecommendationCard
                  key={warning.code}
                  variant="warning"
                  title={warning.message}
                  reason={warning.explanation}
                  evidence={warning.code}
                  expectedImpact="Avoid consistency losses from current curve or color stress." 
                />
              ))}
              {result.optimization.suggestions.map((suggestion) => (
                <RecommendationCard
                  key={`${suggestion.action}-${suggestion.bucket}`}
                  variant="suggestion"
                  title={`${suggestion.action.toUpperCase()} ${suggestion.count} card(s) in ${suggestion.bucket}`}
                  reason={suggestion.reason}
                  evidence={suggestion.explanation}
                  expectedImpact="Improve cast consistency and reduce dead turns in early/mid game."
                />
              ))}
              {result.optimization.warnings.length === 0 && result.optimization.suggestions.length === 0 ? (
                <AnalysisCard>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No optimization changes recommended by current heuristics.</p>
                </AnalysisCard>
              ) : null}
            </div>
          </PageSection>
        </>
      ) : null}
    </div>
  );
}

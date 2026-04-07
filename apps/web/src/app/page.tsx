'use client';

import { useState } from 'react';
import type { DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';
import { sampleStandardDecklist } from '@mtg-mana-optimizer/shared';
import { analyzeDeck } from '../api';

export default function HomePage(): JSX.Element {
  const [decklistText, setDecklistText] = useState(sampleStandardDecklist.trim());
  const [analysis, setAnalysis] = useState<DeckAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAnalyze = async (): Promise<void> => {
    setError(null);
    try {
      const result = await analyzeDeck({ decklistText });
      setAnalysis(result);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>MTG Mana Optimizer</h1>
      <p>Standard deck mana curve and mana base recommendations.</p>
      <section>
        <h2>Decklist Input</h2>
        <textarea value={decklistText} onChange={(event) => setDecklistText(event.target.value)} style={{ width: '100%', minHeight: 200, padding: 12 }} />
        <button onClick={onAnalyze} style={{ marginTop: 12, padding: '8px 16px' }}>Analyze Deck</button>
      </section>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {analysis ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
          <section><h3>Parsed Deck Preview</h3><ul>{analysis.parsedDeck.map((card) => <li key={card.name}>{card.quantity}x {card.name}</li>)}</ul></section>
          <section><h3>Mana Curve Chart</h3><ul>{analysis.manaCurveAnalysis.byManaValue.map((bucket) => <li key={bucket.bucket}>MV {bucket.bucket}: {bucket.count}</li>)}</ul></section>
          <section><h3>Land Recommendation</h3><p>Recommended lands: {analysis.landCountRecommendation.recommendedLandCount}</p><p>Average nonland mana value: {analysis.manaCurveAnalysis.averageManaValueNonLands.toFixed(2)}</p></section>
          <section><h3>Colored Source Analysis</h3><ul>{analysis.coloredSourceRecommendation.targets.map((target) => <li key={target.color}>{target.color}: {target.recommendedSources} sources (T{target.turn}, {Math.round(target.targetProbability * 100)}%)</li>)}</ul></section>
          <section style={{ gridColumn: '1 / span 2' }}><h3>Warnings</h3><ul>{analysis.optimization.warnings.map((item) => <li key={item.code}>{item.message}</li>)}</ul></section>
        </div>
      ) : null}
    </main>
  );
}

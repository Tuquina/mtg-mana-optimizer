import type { ReactNode } from 'react';

export function AnalysisCard({ children }: { children: ReactNode }): JSX.Element {
  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      {children}
    </article>
  );
}

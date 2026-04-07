interface RecommendationCardProps {
  title: string;
  reason: string;
  evidence: string;
  expectedImpact: string;
  variant: 'suggestion' | 'warning';
}

/** Structured recommendation display used for optimization guidance. */
export function RecommendationCard({
  title,
  reason,
  evidence,
  expectedImpact,
  variant,
}: RecommendationCardProps): JSX.Element {
  const isWarning = variant === 'warning';

  return (
    <article
      style={{
        border: `1px solid ${isWarning ? 'var(--warning)' : 'var(--border)'}`,
        background: isWarning ? 'var(--warning-soft)' : 'var(--surface)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}><strong>Reason:</strong> {reason}</p>
      <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}><strong>Evidence:</strong> {evidence}</p>
      <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}><strong>Expected impact:</strong> {expectedImpact}</p>
    </article>
  );
}

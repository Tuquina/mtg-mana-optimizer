import type { CurveBucketDto } from '@mtg-mana-optimizer/domain';

interface CurveChartProps {
  title: string;
  data: CurveBucketDto[];
}

/** Lightweight histogram renderer for mana-curve style distributions. */
export function CurveChart({ title, data }: CurveChartProps): JSX.Element {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div>
      <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {data.map((bucket) => (
          <div key={bucket.bucket} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 40px', gap: 10, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{bucket.bucket}</span>
            <div style={{ background: 'var(--surface-muted)', borderRadius: 8, overflow: 'hidden', height: 16 }}>
              <div
                style={{
                  width: `${(bucket.count / max) * 100}%`,
                  minWidth: bucket.count > 0 ? 8 : 0,
                  height: '100%',
                  background: 'var(--accent)',
                }}
              />
            </div>
            <strong>{bucket.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

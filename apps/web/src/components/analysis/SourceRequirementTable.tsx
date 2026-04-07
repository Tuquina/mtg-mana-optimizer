import type { ColoredSourceRecommendationDto } from '@mtg-mana-optimizer/domain';

interface SourceRequirementTableProps {
  recommendation: ColoredSourceRecommendationDto;
}

export function SourceRequirementTable({ recommendation }: SourceRequirementTableProps): JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)' }}>
        <thead>
          <tr>
            {['Color', 'Pips', 'Turn', 'Target %', 'Recommended Sources', 'On Play %', 'On Draw %'].map((label) => (
              <th key={label} style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recommendation.targets.map((target) => (
            <tr key={`${target.color}-${target.turn}`}>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{target.color}</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{target.requiredPips}</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{target.turn}</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{Math.round(target.targetProbability * 100)}%</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{target.recommendedSources}</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{Math.round(target.probabilityOnPlay * 100)}%</td>
              <td style={{ borderBottom: '1px solid var(--border)', padding: '8px 10px' }}>{Math.round(target.probabilityOnDraw * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

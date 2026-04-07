interface DeckTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function DeckTextarea({ value, onChange, disabled }: DeckTextareaProps): JSX.Element {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontWeight: 600 }}>Decklist</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event: { target: { value: string } }) => onChange(event.target.value)}
        placeholder={'4 Monastery Swiftspear\n4 Lightning Strike\n24 Mountain'}
        style={{
          minHeight: 220,
          resize: 'vertical',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 12,
          background: 'var(--surface)',
        }}
      />
    </label>
  );
}

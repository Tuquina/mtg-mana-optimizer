import type { ReactNode } from 'react';

interface PageSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Standard page section wrapper with consistent heading hierarchy. */
export function PageSection({ title, description, children }: PageSectionProps): JSX.Element {
  return (
    <section style={{ marginTop: 24 }}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        {description ? <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

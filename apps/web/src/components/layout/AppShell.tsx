import type { ReactNode } from 'react';

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  container: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 24px',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    gap: 16,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
  },
  nav: {
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  main: {
    flex: 1,
    padding: '24px 0 40px',
  },
};

/** Global application shell with sticky header and responsive content container. */
export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerInner}>
            <div style={styles.brand}>MTG Mana Optimizer</div>
            <nav style={styles.nav} aria-label="Primary">
              <a href="/analyze">Analyze</a>
            </nav>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        <div style={styles.container}>{children}</div>
      </main>
    </div>
  );
}

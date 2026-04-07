import type { ReactNode } from 'react';
import './globals.css';
import { AppShell } from '../components/layout/AppShell';

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

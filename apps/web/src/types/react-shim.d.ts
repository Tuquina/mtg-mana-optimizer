declare module 'react' {
  export type ReactNode = unknown;
  export function useState<T>(initial: T): [T, (next: T | ((prev: T) => T)) => void];
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
}

declare namespace JSX {
  interface Element {}

  interface ElementChildrenAttribute {
    children: {};
  }

  interface IntrinsicAttributes {
    key?: string | number;
  }

  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

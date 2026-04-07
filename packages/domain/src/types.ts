/** Supported Magic colors. */
export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';

/** Card type labels used by optimization heuristics. */
export type CardType =
  | 'Creature'
  | 'Instant'
  | 'Sorcery'
  | 'Artifact'
  | 'Enchantment'
  | 'Planeswalker'
  | 'Land'
  | 'Battle'
  | 'Other';

/** Explicit colored mana-pip requirement value object. */
export interface ManaPipRequirement {
  color: ManaColor;
  count: number;
}

/** Parsed mana cost value object with derived metadata. */
export interface ManaCost {
  raw: string;
  manaValue: number;
  pipRequirements: ManaPipRequirement[];
}

/** Standard deck card entry with analyzer-specific metadata. */
export interface DeckCard {
  name: string;
  manaCost: string;
  manaValue: number;
  colors: ManaColor[];
  colorPipRequirements: Partial<Record<ManaColor, number>>;
  cardTypes: CardType[];
  quantity: number;
  expectedCastTurn: number;
  expectedCastBucket: number;
}

/** Canonical deck aggregate root (main + sideboard). */
export interface Deck {
  mainDeck: DeckCard[];
  sideboard: DeckCard[];
}

/** Backward-compatible alias for legacy references. */
export type DeckList = Deck;

/** Validation output for format constraints. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

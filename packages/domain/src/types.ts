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

/** Canonical main + sideboard model. */
export interface DeckList {
  mainDeck: DeckCard[];
  sideboard: DeckCard[];
}

/** Validation output for format constraints. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

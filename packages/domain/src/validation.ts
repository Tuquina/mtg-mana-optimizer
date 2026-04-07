import type { DeckList, ValidationResult } from './types';

/** Basic Standard constraints for main deck and sideboard sizing. */
export const validateStandardDeck = (deck: DeckList): ValidationResult => {
  const errors: string[] = [];
  const mainDeckSize = deck.mainDeck.reduce((acc, card) => acc + card.quantity, 0);
  const sideboardSize = deck.sideboard.reduce((acc, card) => acc + card.quantity, 0);

  if (mainDeckSize < 60) {
    errors.push(`Main deck must have at least 60 cards, got ${mainDeckSize}.`);
  }

  if (sideboardSize > 15) {
    errors.push(`Sideboard cannot exceed 15 cards, got ${sideboardSize}.`);
  }

  const grouped = new Map<string, number>();
  [...deck.mainDeck, ...deck.sideboard].forEach((card) => {
    grouped.set(card.name, (grouped.get(card.name) ?? 0) + card.quantity);
  });

  grouped.forEach((count, name) => {
    const isBasicLand = name.includes('Plains') || name.includes('Island') || name.includes('Swamp') || name.includes('Mountain') || name.includes('Forest');
    if (!isBasicLand && count > 4) {
      errors.push(`${name} exceeds 4-copy limit with ${count} copies.`);
    }
  });

  return { valid: errors.length === 0, errors };
};

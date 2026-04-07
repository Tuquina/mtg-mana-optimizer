import type { DeckCard } from '@mtg-mana-optimizer/domain';
import { cardCatalog } from './card-catalog';

/** Parse a plain-text decklist with `quantity card name` lines into cards. */
export const parseDecklist = (decklistText: string): DeckCard[] => {
  return decklistText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) {
        throw new Error(`Invalid deck line: ${line}`);
      }

      const quantity = Number(match[1] ?? 0);
      const name = match[2] ?? '';
      const seeded = cardCatalog[name];

      if (seeded) {
        return {
          ...seeded,
          quantity,
        };
      }

      return {
        name,
        quantity,
        manaCost: '',
        manaValue: 2,
        colors: [],
        colorPipRequirements: {},
        cardTypes: ['Other'],
        expectedCastTurn: 2,
        expectedCastBucket: 2,
      } satisfies DeckCard;
    });
};

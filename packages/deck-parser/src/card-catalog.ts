import type { DeckCard } from '@mtg-mana-optimizer/domain';

/** Minimal seed card catalog for demo and tests. */
export const cardCatalog: Record<string, Omit<DeckCard, 'quantity'>> = {
  'Monastery Swiftspear': {
    name: 'Monastery Swiftspear',
    manaCost: '{R}',
    manaValue: 1,
    colors: ['R'],
    colorPipRequirements: { R: 1 },
    cardTypes: ['Creature'],
    expectedCastTurn: 1,
    expectedCastBucket: 1,
  },
  'Kumano Faces Kakkazan': {
    name: 'Kumano Faces Kakkazan',
    manaCost: '{R}',
    manaValue: 1,
    colors: ['R'],
    colorPipRequirements: { R: 1 },
    cardTypes: ['Enchantment'],
    expectedCastTurn: 1,
    expectedCastBucket: 1,
  },
  Mountain: {
    name: 'Mountain',
    manaCost: '',
    manaValue: 0,
    colors: ['R'],
    colorPipRequirements: {},
    cardTypes: ['Land'],
    expectedCastTurn: 0,
    expectedCastBucket: 0,
  },
};

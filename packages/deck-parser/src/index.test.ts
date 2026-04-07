import { describe, expect, it } from 'vitest';
import { parseDecklist } from './index';

describe('parseDecklist', () => {
  it('parses quantity and card names', () => {
    const result = parseDecklist('4 Monastery Swiftspear\n2 Unknown Card');

    expect(result[0]?.name).toBe('Monastery Swiftspear');
    expect(result[0]?.quantity).toBe(4);
    expect(result[1]?.manaValue).toBe(2);
  });
});

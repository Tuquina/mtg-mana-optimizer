export interface DeckValidationResult {
  valid: boolean;
  errors: string[];
}

const DECK_LINE_PATTERN = /^(\d+)\s+(.+)$/;

/**
 * Performs lightweight client-side validation before sending a decklist to the backend parser.
 * This avoids avoidable network calls while keeping parsing/analysis authority on the server.
 */
export function validateDecklist(decklistText: string): DeckValidationResult {
  const trimmed = decklistText.trim();
  if (!trimmed) {
    return { valid: false, errors: ['Decklist cannot be empty.'] };
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const malformedLines = lines.filter((line) => {
    const lowered = line.toLowerCase();
    if (lowered === 'sideboard') {
      return false;
    }
    return !DECK_LINE_PATTERN.test(line);
  });

  if (malformedLines.length > 0) {
    return {
      valid: false,
      errors: ['Some lines do not match "<quantity> <card name>" format.'],
    };
  }

  return { valid: true, errors: [] };
}

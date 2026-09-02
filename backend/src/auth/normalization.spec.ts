import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeName } from './normalization.js';

describe('normalizeEmail', () => {
  // BR-AUTH-001: the stored form is lowercase and free of surrounding spaces.
  it.each([
    ['  Maria@Financy.TEST  ', 'maria@financy.test'],
    ['ANA@FINANCY.TEST', 'ana@financy.test'],
    ['ana@financy.test', 'ana@financy.test'],
    ['\u00A0ana@financy.test\u00A0', 'ana@financy.test'],
    // A zero-width space is a format character, not whitespace.
    ['\u200Bana@financy.test', 'ana@financy.test'],
    ['ana@financy\u200D.test', 'ana@financy.test'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });
});

describe('normalizeName', () => {
  it('keeps the displayable casing while trimming the edges', () => {
    expect(normalizeName('  Ana Maria  ')).toBe('Ana Maria');
  });
});

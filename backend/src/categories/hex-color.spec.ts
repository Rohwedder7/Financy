import { describe, expect, it } from 'vitest';
import { HEX_COLOR_PATTERN, normalizeHexColor, toOptionalHexColor } from './hex-color.js';

describe('hex color', () => {
  it('accepts a six-digit hex value after uppercasing', () => {
    expect(normalizeHexColor('  #a1b2c3  ')).toBe('#A1B2C3');
    expect(HEX_COLOR_PATTERN.test('#A1B2C3')).toBe(true);
  });

  it('rejects short or hashless values', () => {
    expect(HEX_COLOR_PATTERN.test('#FFF')).toBe(false);
    expect(HEX_COLOR_PATTERN.test('A1B2C3')).toBe(false);
    expect(HEX_COLOR_PATTERN.test('#A1B2C3FF')).toBe(false);
  });

  it('treats a blank string as an absent colour', () => {
    expect(toOptionalHexColor('   ')).toBeNull();
    expect(toOptionalHexColor(null)).toBeNull();
    expect(toOptionalHexColor(undefined)).toBeUndefined();
  });
});

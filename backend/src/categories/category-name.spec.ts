import { describe, expect, it } from 'vitest';
import { displayCategoryName, normalizeCategoryName } from './category-name.js';

describe('normalizeCategoryName', () => {
  it.each([
    ['  Mercado  ', 'mercado'],
    ['MERCADO', 'mercado'],
    ['Aluguel', 'aluguel'],
    ['\u200Balimentação', 'alimentação'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeCategoryName(input)).toBe(expected);
  });
});

describe('displayCategoryName', () => {
  it('keeps the displayable casing while trimming the edges', () => {
    expect(displayCategoryName('  Mercado Extra  ')).toBe('Mercado Extra');
  });
});

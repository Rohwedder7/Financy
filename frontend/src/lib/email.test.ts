import { describe, expect, it } from 'vitest'
import { normalizeEmail } from './email.ts'

describe('normalizeEmail', () => {
  it('trims, lowercases and strips format characters', () => {
    expect(normalizeEmail('  Ana@Financy.TEST  ')).toBe('ana@financy.test')
    expect(normalizeEmail('\u200Bana@financy.test')).toBe('ana@financy.test')
  })
})

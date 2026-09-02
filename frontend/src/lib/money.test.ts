import { describe, expect, it } from 'vitest'
import { formatCentsForInput, formatCentsToBRL, parseLocalizedAmountToCents } from './money.ts'

describe('parseLocalizedAmountToCents', () => {
  it('converts 10,05 to integer cents without binary drift', () => {
    expect(parseLocalizedAmountToCents('10,05')).toBe(1005)
    expect(parseLocalizedAmountToCents(' 10,05 ')).toBe(1005)
    expect(parseLocalizedAmountToCents('0,10')).toBe(10)
    expect(parseLocalizedAmountToCents('1.234,56')).toBe(123_456)
  })

  it('rejects zero, empty and more than two decimals', () => {
    expect(parseLocalizedAmountToCents('0')).toBeNull()
    expect(parseLocalizedAmountToCents('0,00')).toBeNull()
    expect(parseLocalizedAmountToCents('')).toBeNull()
    expect(parseLocalizedAmountToCents('10,055')).toBeNull()
    expect(parseLocalizedAmountToCents('10.05')).toBeNull()
  })
})

describe('formatCentsToBRL', () => {
  it('renders 1005 as R$ 10,05', () => {
    expect(formatCentsToBRL(1005)).toBe('R$ 10,05')
    expect(formatCentsToBRL(10)).toBe('R$ 0,10')
    expect(formatCentsToBRL(123_456)).toBe('R$ 1.234,56')
  })
})

describe('formatCentsForInput', () => {
  it('round-trips the localized form used in the dialog', () => {
    expect(formatCentsForInput(1005)).toBe('10,05')
    expect(parseLocalizedAmountToCents(formatCentsForInput(1005))).toBe(1005)
  })
})

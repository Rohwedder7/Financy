import { describe, expect, it } from 'vitest'
import { EMPTY_DASHBOARD, summarizeDashboard } from './summarize.ts'

describe('summarizeDashboard', () => {
  it('AC-001: balance is integer income minus integer expense', () => {
    expect(
      summarizeDashboard([
        { amountInCents: 4_250_00, type: 'INCOME' },
        { amountInCents: 1_005, type: 'EXPENSE' },
      ]),
    ).toEqual({
      balanceInCents: 4_239_95,
      expenseInCents: 1_005,
      incomeInCents: 4_250_00,
    })
  })

  it('AC-002: no rows produce zeros rather than nulls', () => {
    expect(summarizeDashboard([])).toEqual(EMPTY_DASHBOARD)
  })
})

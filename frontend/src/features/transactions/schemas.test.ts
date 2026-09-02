import { describe, expect, it } from 'vitest'
import { toTransactionInput } from './schemas.ts'

describe('toTransactionInput', () => {
  it('AC-001: sends 10,05 as 1005 cents', () => {
    expect(
      toTransactionInput({
        amount: '10,05',
        categoryId: 'cat-mercado',
        description: 'Jantar',
        occurredOn: '2026-01-15',
        type: 'EXPENSE',
      }),
    ).toEqual({
      amountInCents: 1005,
      categoryId: 'cat-mercado',
      description: 'Jantar',
      occurredAt: '2026-01-15T12:00:00.000Z',
      type: 'EXPENSE',
    })
  })
})

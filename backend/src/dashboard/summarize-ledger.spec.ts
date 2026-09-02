import { describe, expect, it } from 'vitest';
import { TransactionType } from '../generated/prisma/enums.js';
import { summarizeLedger } from './summarize-ledger.js';

describe('summarizeLedger', () => {
  it('AC-001: balance is integer income minus integer expense', () => {
    expect(
      summarizeLedger([
        { amountInCents: 4_250_00, type: TransactionType.INCOME },
        { amountInCents: 1_005, type: TransactionType.EXPENSE },
        { amountInCents: 2_000, type: TransactionType.EXPENSE },
      ]),
    ).toEqual({
      balanceInCents: 4_219_95,
      expenseInCents: 3_005,
      incomeInCents: 4_250_00,
    });
  });

  it('AC-002: no rows produce zeros rather than nulls', () => {
    expect(summarizeLedger([])).toEqual({
      balanceInCents: 0,
      expenseInCents: 0,
      incomeInCents: 0,
    });
  });
});

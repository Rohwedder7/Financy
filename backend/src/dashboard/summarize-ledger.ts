import { TransactionType } from '../generated/prisma/enums.js';

export interface LedgerRow {
  amountInCents: number;
  type: TransactionType;
}

export interface DashboardTotals {
  balanceInCents: number;
  expenseInCents: number;
  incomeInCents: number;
}

/** BR-MONEY-001: income, expense and balance stay integer cents. */
export function summarizeLedger(rows: LedgerRow[]): DashboardTotals {
  let incomeInCents = 0;
  let expenseInCents = 0;

  for (const row of rows) {
    if (row.type === TransactionType.INCOME) {
      incomeInCents += row.amountInCents;
    } else {
      expenseInCents += row.amountInCents;
    }
  }

  return {
    balanceInCents: incomeInCents - expenseInCents,
    expenseInCents,
    incomeInCents,
  };
}

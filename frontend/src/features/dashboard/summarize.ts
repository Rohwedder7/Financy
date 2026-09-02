export type DashboardTotals = {
  balanceInCents: number
  expenseInCents: number
  incomeInCents: number
}

export const EMPTY_DASHBOARD: DashboardTotals = {
  balanceInCents: 0,
  expenseInCents: 0,
  incomeInCents: 0,
}

/** BR-MONEY-001: income, expense and balance stay integer cents. */
export function summarizeDashboard(
  rows: { amountInCents: number; type: 'EXPENSE' | 'INCOME' }[],
): DashboardTotals {
  let incomeInCents = 0
  let expenseInCents = 0

  for (const row of rows) {
    if (row.type === 'INCOME') {
      incomeInCents += row.amountInCents
    } else {
      expenseInCents += row.amountInCents
    }
  }

  return {
    balanceInCents: incomeInCents - expenseInCents,
    expenseInCents,
    incomeInCents,
  }
}

import { useQuery } from '@apollo/client/react'
import { AppShell } from '../shell/app-shell.tsx'
import { RecentTransactions } from '../transactions/transaction-list.tsx'
import { TRANSACTIONS_QUERY, type Transaction } from '../transactions/operations.ts'
import { DASHBOARD_QUERY } from './operations.ts'
import type { DashboardTotals } from './summarize.ts'
import { SummaryCards } from './summary-cards.tsx'

export function DashboardPage() {
  const summaryQuery = useQuery<{ dashboard: DashboardTotals }>(DASHBOARD_QUERY)
  const listQuery = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY)
  const dashboard = summaryQuery.data?.dashboard
  const transactions = listQuery.data?.transactions ?? []

  return (
    <AppShell title="Dashboard">
      {summaryQuery.loading && !summaryQuery.data ? (
        <p className="text-financy-muted" role="status">
          Carregando resumo…
        </p>
      ) : null}

      {summaryQuery.error && !summaryQuery.data ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          Não foi possível carregar o resumo.
        </p>
      ) : null}

      {dashboard ? <SummaryCards dashboard={dashboard} /> : null}

      {listQuery.loading && !listQuery.data ? (
        <p className="mt-8 text-financy-muted" role="status">
          Carregando movimentações…
        </p>
      ) : null}

      {listQuery.error && !listQuery.data ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          Não foi possível carregar as movimentações.
        </p>
      ) : null}

      {listQuery.data ? (
        <div className="mt-8">
          <RecentTransactions transactions={transactions} />
        </div>
      ) : null}
    </AppShell>
  )
}

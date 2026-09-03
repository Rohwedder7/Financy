import { Link } from 'react-router'
import { useQuery } from '@apollo/client/react'
import { AppShell } from '../shell/app-shell.tsx'
import { CATEGORIES_QUERY, type Category } from '../categories/operations.ts'
import { RecentTransactions } from '../transactions/transaction-list.tsx'
import { TRANSACTIONS_QUERY, type Transaction } from '../transactions/operations.ts'
import { CategoryTag } from '../../components/category-tag.tsx'
import { DASHBOARD_QUERY } from './operations.ts'
import type { DashboardTotals } from './summarize.ts'
import { figmaFrames } from '../../theme/figma-frames.ts'
import { SummaryCards } from './summary-cards.tsx'

export function DashboardPage() {
  const summaryQuery = useQuery<{ dashboard: DashboardTotals }>(DASHBOARD_QUERY)
  const listQuery = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY)
  const categoriesQuery = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
  const dashboard = summaryQuery.data?.dashboard
  const transactions = listQuery.data?.transactions ?? []
  const categories = categoriesQuery.data?.categories ?? []

  return (
    <AppShell figmaNode={figmaFrames.dashboard} title="Dashboard">
      {summaryQuery.loading && !summaryQuery.data ? (
        <p className="text-financy-muted" role="status">
          Carregando resumo…
        </p>
      ) : null}

      {summaryQuery.error && !summaryQuery.data ? (
        <p
          className="rounded-lg bg-financy-danger/10 px-3 py-2 text-sm text-financy-danger"
          role="alert"
        >
          Não foi possível carregar o resumo.
        </p>
      ) : null}

      {dashboard ? <SummaryCards dashboard={dashboard} /> : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          {listQuery.loading && !listQuery.data ? (
            <p className="text-financy-muted" role="status">
              Carregando movimentações…
            </p>
          ) : null}

          {listQuery.error && !listQuery.data ? (
            <p
              className="rounded-lg bg-financy-danger/10 px-3 py-2 text-sm text-financy-danger"
              role="alert"
            >
              Não foi possível carregar as movimentações.
            </p>
          ) : null}

          {listQuery.data ? <RecentTransactions transactions={transactions} /> : null}
        </div>

        <aside aria-label="Categorias">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-financy-muted uppercase">
              Categorias
            </h2>
            <Link className="text-sm font-medium text-financy-green" to="/categorias">
              Ver todas
            </Link>
          </div>
          {categoriesQuery.loading && !categoriesQuery.data ? (
            <p className="mt-3 text-sm text-financy-muted" role="status">
              Carregando categorias…
            </p>
          ) : null}
          {categoriesQuery.data && categories.length === 0 ? (
            <p className="mt-3 text-sm text-financy-muted">Nenhuma categoria ainda.</p>
          ) : null}
          {categories.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {categories.slice(0, 8).map((category) => (
                <li
                  className="flex items-center justify-between gap-2 rounded-xl border border-financy-border bg-white px-3 py-2"
                  key={category.id}
                >
                  <CategoryTag color={category.color} name={category.name} />
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </AppShell>
  )
}

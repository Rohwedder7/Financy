import { gql } from '@apollo/client'
import type { ApolloCache } from '@apollo/client'
import type { DashboardTotals } from './summarize.ts'

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboard {
      balanceInCents
      expenseInCents
      incomeInCents
    }
  }
`

export function writeDashboard(cache: ApolloCache, dashboard: DashboardTotals): void {
  cache.writeQuery({ data: { dashboard }, query: DASHBOARD_QUERY })
}

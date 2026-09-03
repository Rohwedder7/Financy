import { formatCentsToBRL } from '../../lib/money.ts'
import type { DashboardTotals } from './summarize.ts'

function amountClass(label: string, amountInCents: number): string {
  if (label === 'Receitas' || (label === 'Saldo' && amountInCents >= 0)) {
    return 'text-financy-success'
  }

  if (label === 'Despesas' || amountInCents < 0) {
    return 'text-financy-danger'
  }

  return 'text-financy-ink'
}

export function SummaryCards({ dashboard }: { dashboard: DashboardTotals }) {
  const cards = [
    { amountInCents: dashboard.balanceInCents, label: 'Saldo' },
    { amountInCents: dashboard.incomeInCents, label: 'Receitas' },
    { amountInCents: dashboard.expenseInCents, label: 'Despesas' },
  ]

  return (
    <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article className="rounded-2xl border border-financy-border bg-white px-4 py-5" key={card.label}>
          <h2 className="text-xs font-semibold tracking-wide text-financy-muted uppercase">{card.label}</h2>
          <p className={`mt-3 text-2xl font-semibold ${amountClass(card.label, card.amountInCents)}`}>
            {formatCentsToBRL(card.amountInCents)}
          </p>
        </article>
      ))}
    </section>
  )
}

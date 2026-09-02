import { Link } from 'react-router'
import { formatCentsToBRL, formatOccurredOn } from '../../lib/money.ts'
import type { Transaction } from './operations.ts'

export function TransactionRows({ transactions }: { transactions: Transaction[] }) {
  return (
    <ul className="divide-y divide-financy-border rounded-2xl border border-financy-border bg-white">
      {transactions.map((transaction) => {
        const income = transaction.type === 'INCOME'

        return (
          <li className="flex flex-wrap items-center gap-3 px-4 py-3" key={transaction.id}>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-financy-muted">
                {formatOccurredOn(transaction.occurredAt)} · {transaction.category.name}
              </p>
            </div>
            <p className={`text-sm font-semibold ${income ? 'text-financy-green' : 'text-red-700'}`}>
              {income ? '+' : '−'} {formatCentsToBRL(transaction.amountInCents)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

export function TransactionList({
  onEdit,
  onRemove,
  transactions,
}: {
  onEdit: (transaction: Transaction, trigger: HTMLElement) => void
  onRemove: (transaction: Transaction, trigger: HTMLElement) => void
  transactions: Transaction[]
}) {
  return (
    <ul className="divide-y divide-financy-border rounded-2xl border border-financy-border bg-white">
      {transactions.map((transaction) => {
        const income = transaction.type === 'INCOME'

        return (
          <li className="flex flex-wrap items-center gap-3 px-4 py-3" key={transaction.id}>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-financy-muted">
                {formatOccurredOn(transaction.occurredAt)} · {transaction.category.name}
              </p>
            </div>
            <p className={`text-sm font-semibold ${income ? 'text-financy-green' : 'text-red-700'}`}>
              {income ? '+' : '−'} {formatCentsToBRL(transaction.amountInCents)}
            </p>
            <button
              className="text-sm font-medium text-financy-green"
              onClick={(event) => onEdit(transaction, event.currentTarget)}
              type="button"
            >
              Editar
            </button>
            <button
              className="text-sm font-medium text-red-700"
              onClick={(event) => onRemove(transaction, event.currentTarget)}
              type="button"
            >
              Excluir
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-financy-muted">Nenhuma movimentação ainda.</p>
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-financy-muted">
          Movimentações recentes
        </h2>
        <Link className="text-sm font-medium text-financy-green" to="/transacoes">
          Ver todas
        </Link>
      </div>
      <TransactionRows transactions={transactions.slice(0, 8)} />
    </div>
  )
}

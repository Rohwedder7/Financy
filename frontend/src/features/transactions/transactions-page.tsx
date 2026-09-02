import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery } from '@apollo/client/react'
import { AppShell } from '../shell/app-shell.tsx'
import { CATEGORIES_QUERY, type Category } from '../categories/operations.ts'
import { DeleteTransactionDialog } from './delete-transaction-dialog.tsx'
import { TransactionFormDialog } from './transaction-form-dialog.tsx'
import { TransactionList } from './transaction-list.tsx'
import {
  CREATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  TRANSACTIONS_QUERY,
  UPDATE_TRANSACTION_MUTATION,
  readTransactions,
  sortTransactions,
  writeTransactions,
  type Transaction,
} from './operations.ts'

export function TransactionsPage() {
  const listQuery = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY)
  const categoriesQuery = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
  const [createTransaction] = useMutation<{ createTransaction: Transaction }>(CREATE_TRANSACTION_MUTATION, {
    update(cache, { data }) {
      if (!data?.createTransaction) {
        return
      }

      writeTransactions(cache, sortTransactions([...readTransactions(cache), data.createTransaction]))
    },
  })
  const [updateTransaction] = useMutation<{ updateTransaction: Transaction }>(UPDATE_TRANSACTION_MUTATION, {
    update(cache, { data }) {
      if (!data?.updateTransaction) {
        return
      }

      writeTransactions(
        cache,
        sortTransactions(
          readTransactions(cache).map((item) =>
            item.id === data.updateTransaction.id ? data.updateTransaction : item,
          ),
        ),
      )
    },
  })
  const [deleteTransaction] = useMutation<{ deleteTransaction: boolean }>(DELETE_TRANSACTION_MUTATION)
  const [editor, setEditor] = useState<Transaction | 'new' | null>(null)
  const [removing, setRemoving] = useState<Transaction | null>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const transactions = listQuery.data?.transactions ?? []
  const categories = categoriesQuery.data?.categories ?? []

  return (
    <AppShell title="Transações">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-financy-muted">Lance receitas e despesas em centavos inteiros.</p>
        <button
          className="rounded-xl bg-financy-green px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={categories.length === 0}
          onClick={(event) => {
            restoreFocusTo.current = event.currentTarget
            setEditor('new')
          }}
          type="button"
        >
          Nova transação
        </button>
      </div>

      {categoriesQuery.data && categories.length === 0 ? (
        <p className="mt-4 text-sm text-financy-muted">
          <Link className="font-medium text-financy-green underline" to="/categorias">
            Crie uma categoria
          </Link>{' '}
          antes de lançar transações.
        </p>
      ) : null}

      {listQuery.loading && !listQuery.data ? (
        <p className="mt-8 text-financy-muted" role="status">
          Carregando transações…
        </p>
      ) : null}

      {listQuery.error && !listQuery.data ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          Não foi possível carregar as transações.
        </p>
      ) : null}

      {listQuery.data && transactions.length === 0 ? (
        <p className="mt-8 text-financy-muted">Nenhuma transação ainda.</p>
      ) : null}

      {transactions.length > 0 ? (
        <div className="mt-8">
          <TransactionList
            onEdit={(transaction, trigger) => {
              restoreFocusTo.current = trigger
              setEditor(transaction)
            }}
            onRemove={(transaction, trigger) => {
              restoreFocusTo.current = trigger
              setRemoving(transaction)
            }}
            transactions={transactions}
          />
        </div>
      ) : null}

      <TransactionFormDialog
        categories={categories}
        key={editor === 'new' ? 'new' : (editor?.id ?? 'closed')}
        onOpenChange={(open) => {
          if (!open) {
            setEditor(null)
          }
        }}
        onSubmit={async (input) => {
          if (editor && editor !== 'new') {
            const result = await updateTransaction({ variables: { id: editor.id, input } })
            if (result.error) {
              throw result.error
            }
            return
          }

          const result = await createTransaction({ variables: { input } })
          if (result.error) {
            throw result.error
          }
        }}
        open={editor !== null}
        restoreFocusTo={restoreFocusTo}
        transaction={editor && editor !== 'new' ? editor : null}
      />

      <DeleteTransactionDialog
        onConfirm={async () => {
          if (!removing) {
            return
          }

          const result = await deleteTransaction({
            update(cache, { data }) {
              if (!data?.deleteTransaction) {
                return
              }

              writeTransactions(
                cache,
                readTransactions(cache).filter((item) => item.id !== removing.id),
              )
            },
            variables: { id: removing.id },
          })

          if (result.error) {
            throw result.error
          }

          if (!result.data?.deleteTransaction) {
            throw new Error('Não foi possível concluir a operação. Tente de novo.')
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setRemoving(null)
          }
        }}
        open={removing !== null}
        restoreFocusTo={restoreFocusTo}
        transaction={removing}
      />
    </AppShell>
  )
}

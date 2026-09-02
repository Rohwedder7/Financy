import { useId, useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field } from '../../components/field.tsx'
import { SelectField } from '../../components/select-field.tsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/dialog.tsx'
import {
  formatCentsForInput,
  occurredOnFromIso,
} from '../../lib/money.ts'
import type { Category } from '../categories/operations.ts'
import { transactionMutationMessage } from './messages.ts'
import type { Transaction } from './operations.ts'
import { toTransactionInput, transactionSchema, type TransactionValues } from './schemas.ts'

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

export function TransactionFormDialog({
  categories,
  onOpenChange,
  onSubmit,
  open,
  restoreFocusTo,
  transaction,
}: {
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ReturnType<typeof toTransactionInput>) => Promise<void>
  open: boolean
  restoreFocusTo: RefObject<HTMLElement | null>
  transaction: Transaction | null
}) {
  const titleId = useId()
  const [formError, setFormError] = useState<string | null>(null)
  const isEdit = transaction !== null
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<TransactionValues>({
    defaultValues: {
      amount: transaction ? formatCentsForInput(transaction.amountInCents) : '',
      categoryId: transaction?.categoryId ?? '',
      description: transaction?.description ?? '',
      occurredOn: transaction ? occurredOnFromIso(transaction.occurredAt) : todayIsoDate(),
      type: transaction?.type ?? 'EXPENSE',
    },
    resolver: zodResolver(transactionSchema),
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        labelledBy={titleId}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          restoreFocusTo.current?.focus()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          document.getElementById('transaction-description')?.focus()
        }}
      >
        <DialogTitle className="text-xl font-semibold tracking-tight" id={titleId}>
          {isEdit ? 'Editar transação' : 'Nova transação'}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-financy-muted">
          O valor usa vírgula decimal, como 10,05. A categoria precisa ser uma das suas.
        </DialogDescription>
        <form
          className="mt-6 grid gap-4"
          noValidate
          onSubmit={handleSubmit(async (values) => {
            setFormError(null)
            try {
              await onSubmit(toTransactionInput(values))
              onOpenChange(false)
            } catch (error) {
              setFormError(transactionMutationMessage(error))
            }
          })}
        >
          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
          <Field
            error={errors.description?.message}
            id="transaction-description"
            label="Descrição"
            {...register('description')}
          />
          <Field
            error={errors.amount?.message}
            id="transaction-amount"
            inputMode="decimal"
            label="Valor"
            placeholder="10,05"
            {...register('amount')}
          />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-financy-ink">Tipo</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="EXPENSE" {...register('type')} />
                Despesa
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="INCOME" {...register('type')} />
                Receita
              </label>
            </div>
            {errors.type?.message ? (
              <p className="text-sm text-red-700" role="alert">
                {errors.type.message}
              </p>
            ) : null}
          </fieldset>
          <Field error={errors.occurredOn?.message} id="transaction-date" label="Data" type="date" {...register('occurredOn')} />
          <SelectField error={errors.categoryId?.message} id="transaction-category" label="Categoria" {...register('categoryId')}>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border border-financy-border px-4 py-2 text-sm font-medium"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-financy-green px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isEdit ? 'Salvar' : 'Criar transação'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

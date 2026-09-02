import { useId, useState, type RefObject } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/dialog.tsx'
import { transactionMutationMessage } from './messages.ts'
import type { Transaction } from './operations.ts'

export function DeleteTransactionDialog({
  onConfirm,
  onOpenChange,
  open,
  restoreFocusTo,
  transaction,
}: {
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
  restoreFocusTo: RefObject<HTMLElement | null>
  transaction: Transaction | null
}) {
  const titleId = useId()
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          setFormError(null)
        }
        onOpenChange(next)
      }}
      open={open}
    >
      <DialogContent
        labelledBy={titleId}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          restoreFocusTo.current?.focus()
        }}
      >
        <DialogTitle className="text-xl font-semibold tracking-tight" id={titleId}>
          Excluir transação
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-financy-muted">
          {transaction
            ? `A transação ${transaction.description} será excluída. Esta ação não pode ser desfeita.`
            : 'Confirme a exclusão da transação.'}
        </DialogDescription>
        {formError ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-xl border border-financy-border px-4 py-2 text-sm font-medium"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending || !transaction}
            onClick={async () => {
              setFormError(null)
              setPending(true)
              try {
                await onConfirm()
                onOpenChange(false)
              } catch (error) {
                setFormError(transactionMutationMessage(error))
              } finally {
                setPending(false)
              }
            }}
            type="button"
          >
            Excluir
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

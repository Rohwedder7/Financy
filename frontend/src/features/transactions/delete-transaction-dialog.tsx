import { useId, useState, type RefObject } from 'react'
import { Button } from '../../components/button.tsx'
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
          <p
            className="mt-4 rounded-lg bg-financy-danger/10 px-3 py-2 text-sm text-financy-danger"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button
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
            variant="danger"
            type="button"
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

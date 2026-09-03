import { useId, useState, type RefObject } from 'react'
import { Button } from '../../components/button.tsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/dialog.tsx'
import { categoryMutationMessage } from './messages.ts'
import type { Category } from './operations.ts'

export function DeleteCategoryDialog({
  category,
  onConfirm,
  onOpenChange,
  open,
  restoreFocusTo,
}: {
  category: Category | null
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
  restoreFocusTo: RefObject<HTMLElement | null>
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
          Excluir categoria
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-financy-muted">
          {category
            ? `A categoria ${category.name} será excluída. Esta ação não pode ser desfeita.`
            : 'Confirme a exclusão da categoria.'}
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
            disabled={pending || !category}
            onClick={async () => {
              setFormError(null)
              setPending(true)
              try {
                await onConfirm()
                onOpenChange(false)
              } catch (error) {
                setFormError(categoryMutationMessage(error))
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

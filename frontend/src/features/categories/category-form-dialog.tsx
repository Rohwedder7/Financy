import { useId, useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field } from '../../components/field.tsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/dialog.tsx'
import { categoryMutationMessage } from './messages.ts'
import type { Category } from './operations.ts'
import { categorySchema, toCategoryInput, type CategoryValues } from './schemas.ts'

export function CategoryFormDialog({
  category,
  onOpenChange,
  onSubmit,
  open,
  restoreFocusTo,
}: {
  category: Category | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: { color?: string | null; name: string }) => Promise<void>
  open: boolean
  restoreFocusTo: RefObject<HTMLElement | null>
}) {
  const titleId = useId()
  const [formError, setFormError] = useState<string | null>(null)
  const isEdit = category !== null
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CategoryValues>({
    defaultValues: {
      color: category?.color ?? '',
      name: category?.name ?? '',
    },
    resolver: zodResolver(categorySchema),
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
          document.getElementById('category-name')?.focus()
        }}
      >
        <DialogTitle className="text-xl font-semibold tracking-tight" id={titleId}>
          {isEdit ? 'Editar categoria' : 'Nova categoria'}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-financy-muted">
          {isEdit
            ? 'Altere o nome ou a cor. O nome precisa ser único entre as suas categorias.'
            : 'Informe um nome único. A cor é opcional e usa o formato #RRGGBB.'}
        </DialogDescription>
        <form
          className="mt-6 grid gap-4"
          noValidate
          onSubmit={handleSubmit(async (values) => {
            setFormError(null)
            try {
              await onSubmit(toCategoryInput(values))
              onOpenChange(false)
            } catch (error) {
              setFormError(categoryMutationMessage(error))
            }
          })}
        >
          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
          <Field error={errors.name?.message} id="category-name" label="Nome" {...register('name')} />
          <Field
            error={errors.color?.message}
            id="category-color"
            label="Cor"
            placeholder="#5E55C2"
            {...register('color')}
          />
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
              {isEdit ? 'Salvar' : 'Criar categoria'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

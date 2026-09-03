import { useId, useState, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/button.tsx'
import { Field } from '../../components/field.tsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/dialog.tsx'
import { categorySwatches } from '../../theme/style-guide.ts'
import { figmaFrames } from '../../theme/figma-frames.ts'
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
    setValue,
    watch,
  } = useForm<CategoryValues>({
    defaultValues: {
      color: category?.color ?? '',
      name: category?.name ?? '',
    },
    resolver: zodResolver(categorySchema),
  })
  const selectedColor = watch('color')

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        figmaNode={figmaFrames.dialogs}
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
            : 'Informe um nome único. A cor é opcional; escolha um swatch do Style Guide ou digite #RRGGBB.'}
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
            <p
              className="rounded-lg bg-financy-danger/10 px-3 py-2 text-sm text-financy-danger"
              role="alert"
            >
              {formError}
            </p>
          ) : null}
          <Field
            error={errors.name?.message}
            id="category-name"
            label="Nome"
            {...register('name')}
          />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-financy-ink">Cor</legend>
            <div className="flex flex-wrap gap-2">
              {categorySwatches.map((swatch) => {
                const selected = selectedColor?.toUpperCase() === swatch.toUpperCase()

                return (
                  <button
                    aria-label={`Usar cor ${swatch}`}
                    aria-pressed={selected}
                    className={`size-8 rounded-full border-2 ${selected ? 'border-financy-ink' : 'border-transparent'}`}
                    key={swatch}
                    onClick={() => setValue('color', swatch, { shouldValidate: true })}
                    style={{ backgroundColor: swatch }}
                    type="button"
                  />
                )
              })}
            </div>
            <Field
              error={errors.color?.message}
              id="category-color"
              label="Código"
              placeholder="#125E3F"
              {...register('color')}
            />
          </fieldset>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isEdit ? 'Salvar' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

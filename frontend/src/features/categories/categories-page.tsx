import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { AppShell } from '../shell/app-shell.tsx'
import { CategoryFormDialog } from './category-form-dialog.tsx'
import { DeleteCategoryDialog } from './delete-category-dialog.tsx'
import {
  CATEGORIES_QUERY,
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  readCategories,
  sortCategories,
  writeCategories,
  type Category,
} from './operations.ts'

export function CategoriesPage() {
  const listQuery = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
  const [createCategory] = useMutation<{ createCategory: Category }>(CREATE_CATEGORY_MUTATION, {
    update(cache, { data }) {
      if (!data?.createCategory) {
        return
      }

      writeCategories(cache, sortCategories([...readCategories(cache), data.createCategory]))
    },
  })
  const [updateCategory] = useMutation<{ updateCategory: Category }>(UPDATE_CATEGORY_MUTATION, {
    update(cache, { data }) {
      if (!data?.updateCategory) {
        return
      }

      writeCategories(
        cache,
        sortCategories(
          readCategories(cache).map((item) =>
            item.id === data.updateCategory.id ? data.updateCategory : item,
          ),
        ),
      )
    },
  })
  const [deleteCategory] = useMutation<{ deleteCategory: boolean }>(DELETE_CATEGORY_MUTATION)
  const [editor, setEditor] = useState<Category | 'new' | null>(null)
  const [removing, setRemoving] = useState<Category | null>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const categories = listQuery.data?.categories ?? []

  return (
    <AppShell title="Categorias">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-financy-muted">Organize as categorias das suas transações.</p>
        <button
          className="rounded-xl bg-financy-green px-4 py-2.5 text-sm font-semibold text-white"
          onClick={(event) => {
            restoreFocusTo.current = event.currentTarget
            setEditor('new')
          }}
          type="button"
        >
          Nova categoria
        </button>
      </div>

      {listQuery.loading && !listQuery.data ? (
        <p className="mt-8 text-financy-muted" role="status">
          Carregando categorias…
        </p>
      ) : null}

      {listQuery.error && !listQuery.data ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          Não foi possível carregar as categorias.
        </p>
      ) : null}

      {listQuery.data && categories.length === 0 ? (
        <p className="mt-8 text-financy-muted">Nenhuma categoria ainda.</p>
      ) : null}

      {categories.length > 0 ? (
        <ul className="mt-8 divide-y divide-financy-border rounded-2xl border border-financy-border bg-white">
          {categories.map((category) => (
            <li className="flex items-center gap-3 px-4 py-3" key={category.id}>
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full border border-financy-border"
                style={{ backgroundColor: category.color ?? '#E1E5E3' }}
              />
              <span className="flex-1 font-medium">{category.name}</span>
              <button
                className="text-sm font-medium text-financy-green"
                onClick={(event) => {
                  restoreFocusTo.current = event.currentTarget
                  setEditor(category)
                }}
                type="button"
              >
                Editar
              </button>
              <button
                className="text-sm font-medium text-red-700"
                onClick={(event) => {
                  restoreFocusTo.current = event.currentTarget
                  setRemoving(category)
                }}
                type="button"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <CategoryFormDialog
        category={editor && editor !== 'new' ? editor : null}
        key={editor === 'new' ? 'new' : (editor?.id ?? 'closed')}
        onOpenChange={(open) => {
          if (!open) {
            setEditor(null)
          }
        }}
        onSubmit={async (input) => {
          if (editor && editor !== 'new') {
            const result = await updateCategory({ variables: { id: editor.id, input } })
            if (result.error) {
              throw result.error
            }
            return
          }

          const result = await createCategory({ variables: { input } })
          if (result.error) {
            throw result.error
          }
        }}
        open={editor !== null}
        restoreFocusTo={restoreFocusTo}
      />

      <DeleteCategoryDialog
        category={removing}
        onConfirm={async () => {
          if (!removing) {
            return
          }

          const result = await deleteCategory({
            update(cache, { data }) {
              if (!data?.deleteCategory) {
                return
              }

              writeCategories(
                cache,
                readCategories(cache).filter((item) => item.id !== removing.id),
              )
            },
            variables: { id: removing.id },
          })

          if (result.error) {
            throw result.error
          }

          if (!result.data?.deleteCategory) {
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
      />
    </AppShell>
  )
}

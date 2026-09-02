import { expect, test, type Page } from '@playwright/test'

const TOKEN = 'e2e-secret-token-value'
const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }

interface Category {
  color: string | null
  createdAt: string
  id: string
  name: string
}

async function mockAuthenticatedCategories(
  page: Page,
  options: { inUseIds?: string[] } = {},
) {
  const categories: Category[] = []
  let sequence = 0
  const inUse = new Set(options.inUseIds ?? [])

  await page.addInitScript((token) => {
    sessionStorage.setItem('financy.session', token)
  }, TOKEN)

  await page.route('**/graphql', async (route) => {
    const payload = route.request().postDataJSON() as {
      operationName?: string
      query?: string
      variables?: {
        id?: string
        input?: { color?: string | null; name?: string }
      }
    }
    const name = payload.operationName ?? payload.query ?? ''

    if (name.includes('Me') || /\bme\b/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { me: USER } },
      })
      return
    }

    if (name.includes('Categories') || name.includes('categories {')) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { categories } },
      })
      return
    }

    if (name.includes('CreateCategory') || name.includes('createCategory')) {
      const input = payload.variables?.input ?? {}
      if (categories.some((item) => item.name.toLowerCase() === String(input.name).trim().toLowerCase())) {
        await route.fulfill({
          contentType: 'application/json',
          json: {
            data: null,
            errors: [
              {
                extensions: { code: 'CONFLICT' },
                message: 'A category with this name already exists.',
              },
            ],
          },
        })
        return
      }

      sequence += 1
      const created: Category = {
        color: input.color ?? null,
        createdAt: `2026-01-0${sequence}T00:00:00.000Z`,
        id: `cat-${sequence}`,
        name: String(input.name),
      }
      categories.push(created)
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { createCategory: created } },
      })
      return
    }

    if (name.includes('UpdateCategory') || name.includes('updateCategory')) {
      const current = categories.find((item) => item.id === payload.variables?.id)
      if (!current) {
        await route.fulfill({
          contentType: 'application/json',
          json: {
            data: null,
            errors: [{ extensions: { code: 'NOT_FOUND' }, message: 'Category not found.' }],
          },
        })
        return
      }

      current.name = payload.variables?.input?.name ?? current.name
      current.color =
        payload.variables?.input?.color === undefined
          ? current.color
          : (payload.variables.input.color ?? null)
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { updateCategory: current } },
      })
      return
    }

    if (name.includes('DeleteCategory') || name.includes('deleteCategory')) {
      const id = payload.variables?.id
      if (id && inUse.has(id)) {
        await route.fulfill({
          contentType: 'application/json',
          json: {
            data: null,
            errors: [
              {
                extensions: { code: 'CATEGORY_IN_USE' },
                message: 'This category still has transactions.',
              },
            ],
          },
        })
        return
      }

      const index = categories.findIndex((item) => item.id === id)
      if (index >= 0) {
        categories.splice(index, 1)
      }
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { deleteCategory: true } },
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { data: null },
    })
  })
}

test('AC-001: category CRUD stays on the page and keeps the form after a conflict', async ({
  page,
}) => {
  await mockAuthenticatedCategories(page)
  await page.goto('/categorias')

  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByLabel('Nome').fill('Mercado')
  await page.getByRole('button', { name: 'Criar categoria' }).click()
  await expect(page.getByText('Mercado')).toBeVisible()
  await expect(page).toHaveURL(/\/categorias$/)

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Nome').fill('Mercado Extra')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Mercado Extra')).toBeVisible()

  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByLabel('Nome').fill('Mercado Extra')
  await page.getByRole('button', { name: 'Criar categoria' }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe uma categoria com este nome.')
  await expect(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
  await expect(page.getByLabel('Nome')).toHaveValue('Mercado Extra')
})

test('AC-002: the category dialog traps keyboard focus, names itself and restores on Escape', async ({
  page,
}) => {
  await mockAuthenticatedCategories(page)
  await page.goto('/categorias')

  const trigger = page.getByRole('button', { name: 'Nova categoria' })
  await trigger.click()
  await expect(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
  await expect(page.getByLabel('Nome')).toBeFocused()

  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press('Tab')
    await expect(page.getByRole('dialog').locator(':focus')).toHaveCount(1)
  }

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('AC-003: deleting a used category explains the next possible action', async ({ page }) => {
  await mockAuthenticatedCategories(page, { inUseIds: ['cat-1'] })
  await page.goto('/categorias')

  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByLabel('Nome').fill('Mercado')
  await page.getByRole('button', { name: 'Criar categoria' }).click()
  await expect(page.getByText('Mercado')).toBeVisible()

  await page.getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('dialog', { name: 'Excluir categoria' }).getByRole('button', { name: 'Excluir' }).click()

  await expect(page.getByRole('alert')).toContainText(
    'Renomeie-a ou associe as transações a outra categoria antes de excluir.',
  )
  await expect(page.getByRole('dialog', { name: 'Excluir categoria' })).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('listitem').filter({ hasText: 'Mercado' })).toBeVisible()
})

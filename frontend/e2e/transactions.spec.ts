import { expect, test, type Page } from '@playwright/test'

const TOKEN = 'e2e-secret-token-value'
const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }
const MERCADO = {
  color: '#A1B2C3',
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'cat-mercado',
  name: 'Mercado',
}

interface Transaction {
  amountInCents: number
  category: { color: string | null; id: string; name: string }
  categoryId: string
  createdAt: string
  description: string
  id: string
  occurredAt: string
  type: 'EXPENSE' | 'INCOME'
}

async function mockAuthenticatedTransactions(page: Page) {
  const transactions: Transaction[] = []
  let sequence = 0
  let lastCreateInput: Record<string, unknown> | null = null

  await page.addInitScript((token) => {
    sessionStorage.setItem('financy.session', token)
  }, TOKEN)

  await page.route('**/graphql', async (route) => {
    const payload = route.request().postDataJSON() as {
      operationName?: string
      query?: string
      variables?: {
        id?: string
        input?: {
          amountInCents?: number
          categoryId?: string
          description?: string
          occurredAt?: string
          type?: 'EXPENSE' | 'INCOME'
        }
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
        json: { data: { categories: [MERCADO] } },
      })
      return
    }

    if (name.includes('CreateTransaction') || name.includes('createTransaction')) {
      const input = payload.variables?.input ?? {}
      lastCreateInput = input as Record<string, unknown>
      sequence += 1
      const created: Transaction = {
        amountInCents: Number(input.amountInCents),
        category: { color: MERCADO.color, id: MERCADO.id, name: MERCADO.name },
        categoryId: String(input.categoryId),
        createdAt: `2026-01-0${sequence}T12:00:00.000Z`,
        description: String(input.description),
        id: `txn-${sequence}`,
        occurredAt: String(input.occurredAt),
        type: input.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      }
      transactions.push(created)
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { createTransaction: created } },
      })
      return
    }

    if (name.includes('UpdateTransaction') || name.includes('updateTransaction')) {
      const current = transactions.find((item) => item.id === payload.variables?.id)
      const input = payload.variables?.input ?? {}
      if (!current) {
        await route.fulfill({
          contentType: 'application/json',
          json: {
            data: null,
            errors: [{ extensions: { code: 'NOT_FOUND' }, message: 'Transaction not found.' }],
          },
        })
        return
      }

      current.amountInCents = input.amountInCents ?? current.amountInCents
      current.categoryId = input.categoryId ?? current.categoryId
      current.description = input.description ?? current.description
      current.occurredAt = input.occurredAt ?? current.occurredAt
      current.type = input.type ?? current.type
      current.category = { color: MERCADO.color, id: MERCADO.id, name: MERCADO.name }
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { updateTransaction: current } },
      })
      return
    }

    if (name.includes('DeleteTransaction') || name.includes('deleteTransaction')) {
      const index = transactions.findIndex((item) => item.id === payload.variables?.id)
      if (index >= 0) {
        transactions.splice(index, 1)
      }
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { deleteTransaction: true } },
      })
      return
    }

    if (name.includes('Transactions') || /\btransactions\s*\{/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { transactions } },
      })
      return
    }

    if (name.includes('Dashboard') || /\bdashboard\s*\{/.test(name)) {
      let incomeInCents = 0
      let expenseInCents = 0
      for (const item of transactions) {
        if (item.type === 'INCOME') {
          incomeInCents += item.amountInCents
        } else {
          expenseInCents += item.amountInCents
        }
      }
      await route.fulfill({
        contentType: 'application/json',
        json: {
          data: {
            dashboard: {
              balanceInCents: incomeInCents - expenseInCents,
              expenseInCents,
              incomeInCents,
            },
          },
        },
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { data: null },
    })
  })

  return {
    lastCreateInput: () => lastCreateInput,
  }
}

test('AC-001: 10,05 is sent as 1005 and rendered as R$ 10,05', async ({ page }) => {
  const mock = await mockAuthenticatedTransactions(page)
  await page.goto('/transacoes')

  await page.getByRole('button', { name: 'Nova transação' }).click()
  await page.getByLabel('Descrição').fill('Jantar')
  await page.getByLabel('Valor').fill('10,05')
  await page.getByLabel('Data').fill('2026-01-15')
  await page.getByLabel('Categoria').selectOption(MERCADO.id)
  await page.getByRole('button', { name: 'Criar transação' }).click()

  await expect(page.getByText('Jantar')).toBeVisible()
  await expect(page.getByText('− R$ 10,05')).toBeVisible()
  expect(mock.lastCreateInput()?.amountInCents).toBe(1005)
})

test('the transaction dialog traps keyboard focus, names itself and restores on Escape', async ({
  page,
}) => {
  await mockAuthenticatedTransactions(page)
  await page.goto('/transacoes')

  const trigger = page.getByRole('button', { name: 'Nova transação' })
  await trigger.click()
  await expect(page.getByRole('dialog', { name: 'Nova transação' })).toBeVisible()
  await expect(page.getByLabel('Descrição')).toBeFocused()

  for (let step = 0; step < 10; step += 1) {
    await page.keyboard.press('Tab')
    const focusStaysInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]')
      return Boolean(dialog && document.activeElement && dialog.contains(document.activeElement))
    })
    expect(focusStaysInDialog).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('AC-002: category is required and only session options are listed', async ({ page }) => {
  await mockAuthenticatedTransactions(page)
  await page.goto('/transacoes')

  await page.getByRole('button', { name: 'Nova transação' }).click()
  const options = await page.getByLabel('Categoria').locator('option').allTextContents()
  expect(options).toEqual(['Selecione uma categoria', 'Mercado'])
  expect(options.join()).not.toContain('Aluguel de Bruno')

  await page.getByLabel('Descrição').fill('Jantar')
  await page.getByLabel('Valor').fill('10,05')
  await page.getByRole('button', { name: 'Criar transação' }).click()

  await expect(page.getByText('Selecione uma categoria.')).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Nova transação' })).toBeVisible()
})

test('AC-003: edit and delete update the list and dashboard without duplicating rows', async ({
  page,
}) => {
  await mockAuthenticatedTransactions(page)
  await page.goto('/transacoes')

  await page.getByRole('button', { name: 'Nova transação' }).click()
  await page.getByLabel('Descrição').fill('Jantar')
  await page.getByLabel('Valor').fill('10,05')
  await page.getByLabel('Data').fill('2026-01-15')
  await page.getByLabel('Categoria').selectOption(MERCADO.id)
  await page.getByRole('button', { name: 'Criar transação' }).click()
  await expect(page.getByText('Jantar')).toBeVisible()
  await expect(page.getByText('Jantar')).toHaveCount(1)

  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Jantar')).toHaveCount(1)

  await page.getByRole('link', { name: 'Transações' }).click()
  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Descrição').fill('Jantar no restaurante')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Jantar no restaurante')).toHaveCount(1)

  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByText('Jantar no restaurante')).toHaveCount(1)

  await page.getByRole('link', { name: 'Transações' }).click()
  await page.getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('dialog', { name: 'Excluir transação' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Nenhuma transação ainda.')).toBeVisible()

  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByText('Nenhuma movimentação ainda.')).toBeVisible()
  await expect(page.getByText('Jantar no restaurante')).toHaveCount(0)
})

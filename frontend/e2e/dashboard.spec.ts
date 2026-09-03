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

function dashboardFrom(transactions: Transaction[]) {
  let incomeInCents = 0
  let expenseInCents = 0
  for (const item of transactions) {
    if (item.type === 'INCOME') {
      incomeInCents += item.amountInCents
    } else {
      expenseInCents += item.amountInCents
    }
  }

  return {
    balanceInCents: incomeInCents - expenseInCents,
    expenseInCents,
    incomeInCents,
  }
}

async function mockFinanceGraphQL(page: Page, seed: Transaction[] = []) {
  const transactions: Transaction[] = [...seed]

  await page.addInitScript((token) => {
    sessionStorage.setItem('financy.session', token)
  }, TOKEN)

  await page.route('**/graphql', async (route) => {
    const payload = route.request().postDataJSON() as {
      operationName?: string
      query?: string
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

    if (name.includes('Transactions') || /\btransactions\s*\{/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { transactions } },
      })
      return
    }

    if (name.includes('Dashboard') || /\bdashboard\s*\{/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { dashboard: dashboardFrom(transactions) } },
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { data: null },
    })
  })
}

test('AC-001: summary uses principal data and balance is income minus expense', async ({
  page,
}) => {
  await mockFinanceGraphQL(page, [
    {
      amountInCents: 4_250_00,
      category: { color: null, id: 'cat-salario', name: 'Salário' },
      categoryId: 'cat-salario',
      createdAt: '2026-01-01T12:00:00.000Z',
      description: 'Salário',
      id: 'txn-salario',
      occurredAt: '2026-01-01T12:00:00.000Z',
      type: 'INCOME',
    },
    {
      amountInCents: 1_005,
      category: { color: MERCADO.color, id: MERCADO.id, name: MERCADO.name },
      categoryId: MERCADO.id,
      createdAt: '2026-01-15T12:00:00.000Z',
      description: 'Jantar',
      id: 'txn-jantar',
      occurredAt: '2026-01-15T12:00:00.000Z',
      type: 'EXPENSE',
    },
  ])
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Saldo' })).toBeVisible()
  await expect(
    page.getByRole('article').filter({ hasText: 'Saldo' }).getByText('R$ 4.239,95'),
  ).toBeVisible()
  await expect(
    page.getByRole('article').filter({ hasText: 'Receitas' }).getByText('R$ 4.250,00'),
  ).toBeVisible()
  await expect(
    page.getByRole('article').filter({ hasText: 'Despesas' }).getByText('R$ 10,05'),
  ).toBeVisible()
  await expect(page.getByRole('paragraph').filter({ hasText: /^Salário$/ })).toBeVisible()
  await expect(page.getByText('Jantar', { exact: true })).toBeVisible()
  await expect(page.getByText('Aluguel de Bruno')).toHaveCount(0)
})

test('AC-002: no transactions show zeros and a useful empty state', async ({ page }) => {
  await mockFinanceGraphQL(page)
  await page.goto('/')

  await expect(page.getByRole('region', { name: 'Resumo financeiro' })).toBeVisible()
  await expect(page.getByText('R$ 0,00')).toHaveCount(3)
  await expect(page.getByText('Nenhuma movimentação ainda.')).toBeVisible()
})

test('AC-003: a visitor cannot open private routes and logout returns to login', async ({
  page,
}) => {
  await page.goto('/transacoes')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

  await page.goto('/categorias')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

  await mockFinanceGraphQL(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

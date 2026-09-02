import { expect, test, type Page } from '@playwright/test'

const TOKEN = 'e2e-secret-token-value'
const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }

async function mockGraphQL(page: Page) {
  await page.route('**/graphql', async (route) => {
    const payload = route.request().postDataJSON() as {
      operationName?: string
      query?: string
    }
    const name = payload.operationName ?? payload.query ?? ''

    if (name.includes('SignUp') || name.includes('signUp')) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { signUp: { token: TOKEN, user: USER } } },
      })
      return
    }

    if (name.includes('SignIn') || name.includes('signIn')) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { signIn: { token: TOKEN, user: USER } } },
      })
      return
    }

    if (name.includes('Me') || /\bme\b/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { me: USER } },
      })
      return
    }

    if (name.includes('Transactions') || /\btransactions\s*\{/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: { data: { transactions: [] } },
      })
      return
    }

    if (name.includes('Dashboard') || /\bdashboard\s*\{/.test(name)) {
      await route.fulfill({
        contentType: 'application/json',
        json: {
          data: { dashboard: { balanceInCents: 0, expenseInCents: 0, incomeInCents: 0 } },
        },
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { data: null },
    })
  })
}

test('AC-001: a visitor sees login, reaches sign-up and opens the dashboard', async ({ page }) => {
  const consoleText: string[] = []
  page.on('console', (message) => consoleText.push(message.text()))
  await mockGraphQL(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  await page.getByRole('link', { name: 'Criar conta' }).click()
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()

  await page.getByLabel('Nome').fill('Ana')
  await page.getByLabel('E-mail').fill(USER.email)
  await page.getByLabel('Senha').fill('correct horse')
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Olá, Ana.')).toBeVisible()

  const body = await page.content()
  expect(body).not.toContain(TOKEN)
  expect(page.url()).not.toContain(TOKEN)
  expect(consoleText.join('\n')).not.toContain(TOKEN)
})

test('AC-002: reloading the tab keeps the session; a new session does not', async ({ page }) => {
  await mockGraphQL(page)
  await page.goto('/')
  await page.getByLabel('E-mail').fill(USER.email)
  await page.getByLabel('Senha').fill('correct horse')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // sessionStorage is emptied when the tab is closed; that is the new session.
  await page.evaluate(() => sessionStorage.clear())
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('AC-004: a keyboard submit focuses the first invalid field', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

  await page.getByLabel('E-mail').focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')

  await expect(page.getByLabel('E-mail')).toBeFocused()
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
})

test('logout returns the visitor to login', async ({ page }) => {
  await mockGraphQL(page)
  await page.goto('/')
  await page.getByLabel('E-mail').fill(USER.email)
  await page.getByLabel('Senha').fill('correct horse')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

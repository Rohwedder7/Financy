import { expect, test } from '@playwright/test'

test('the root presents login to a visitor', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
})

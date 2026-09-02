import '@testing-library/jest-dom/vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SIGN_IN_MUTATION, SIGN_UP_MUTATION } from './operations.ts'
import { DASHBOARD_QUERY } from '../dashboard/operations.ts'
import { EMPTY_DASHBOARD } from '../dashboard/summarize.ts'
import { TRANSACTIONS_QUERY } from '../transactions/operations.ts'
import { renderApp } from '../../test/render-app.tsx'

const TOKEN = 'test-session-token'
const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }

afterEach(() => {
  sessionStorage.clear()
})

describe('visitor authentication', () => {
  it('shows login at the root and reaches sign-up', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Criar conta' }))
    expect(await screen.findByRole('heading', { name: 'Criar conta' })).toBeInTheDocument()
  })

  it('opens the dashboard after a valid sign-in', async () => {
    const user = userEvent.setup()
    renderApp({
      mocks: [
        {
          delay: 0,
          request: {
            query: SIGN_IN_MUTATION,
            variables: { input: { email: USER.email, password: 'correct horse' } },
          },
          result: { data: { signIn: { token: TOKEN, user: USER } } },
        },
        {
          delay: 0,
          request: { query: DASHBOARD_QUERY },
          result: { data: { dashboard: EMPTY_DASHBOARD } },
        },
        {
          delay: 0,
          request: { query: TRANSACTIONS_QUERY },
          result: { data: { transactions: [] } },
        },
      ],
    })

    await user.type(await screen.findByLabelText('E-mail'), USER.email)
    await user.type(screen.getByLabelText('Senha'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Olá, Ana.')).toBeInTheDocument()
    expect(screen.queryByText(TOKEN)).not.toBeInTheDocument()
  })

  it('opens the dashboard after a valid sign-up', async () => {
    const user = userEvent.setup()
    renderApp({
      initialPath: '/cadastro',
      mocks: [
        {
          delay: 0,
          request: {
            query: SIGN_UP_MUTATION,
            variables: {
              input: { email: USER.email, name: 'Ana', password: 'correct horse' },
            },
          },
          result: { data: { signUp: { token: TOKEN, user: USER } } },
        },
        {
          delay: 0,
          request: { query: DASHBOARD_QUERY },
          result: { data: { dashboard: EMPTY_DASHBOARD } },
        },
        {
          delay: 0,
          request: { query: TRANSACTIONS_QUERY },
          result: { data: { transactions: [] } },
        },
      ],
    })

    await user.type(await screen.findByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('E-mail'), USER.email)
    await user.type(screen.getByLabelText('Senha'), 'correct horse')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('moves focus to the first invalid field when submitted from the keyboard', async () => {
    const user = userEvent.setup()
    renderApp()

    await screen.findByRole('heading', { name: 'Entrar' })
    await user.keyboard('{Tab}{Tab}{Enter}')

    await waitFor(() => {
      expect(document.getElementById('sign-in-email')).toHaveFocus()
    })
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
  })
})

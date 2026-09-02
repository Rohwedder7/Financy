import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { MockedProviderProps } from '@apollo/client/testing/react'
import { ME_QUERY } from '../auth/operations.ts'
import { writeToken } from '../../lib/session.ts'
import { renderApp } from '../../test/render-app.tsx'
import { TRANSACTIONS_QUERY } from '../transactions/operations.ts'
import { DASHBOARD_QUERY } from './operations.ts'
import { EMPTY_DASHBOARD } from './summarize.ts'

const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }
const MERCADO = { color: '#A1B2C3', createdAt: '2026-01-01T00:00:00.000Z', id: 'cat-mercado', name: 'Mercado' }
const JANTAR = {
  amountInCents: 1005,
  category: { color: MERCADO.color, id: MERCADO.id, name: MERCADO.name },
  categoryId: MERCADO.id,
  createdAt: '2026-01-15T12:00:00.000Z',
  description: 'Jantar',
  id: 'txn-jantar',
  occurredAt: '2026-01-15T12:00:00.000Z',
  type: 'EXPENSE' as const,
}
const SALARIO = {
  amountInCents: 4_250_00,
  category: { color: null, id: 'cat-salario', name: 'Salário' },
  categoryId: 'cat-salario',
  createdAt: '2026-01-01T12:00:00.000Z',
  description: 'Salário',
  id: 'txn-salario',
  occurredAt: '2026-01-01T12:00:00.000Z',
  type: 'INCOME' as const,
}

afterEach(() => {
  sessionStorage.clear()
})

function meMock() {
  return { delay: 0, request: { query: ME_QUERY }, result: { data: { me: USER } } }
}

function renderDashboard(mocks: MockedProviderProps['mocks'] = []) {
  writeToken('test-session-token')
  return renderApp({
    mocks: [meMock(), ...mocks],
  })
}

describe('dashboard page', () => {
  it('AC-001: summary uses the principal totals and income minus expense', async () => {
    renderDashboard([
      {
        delay: 0,
        request: { query: DASHBOARD_QUERY },
        result: {
          data: {
            dashboard: { balanceInCents: 4_239_95, expenseInCents: 1_005, incomeInCents: 4_250_00 },
          },
        },
      },
      {
        delay: 0,
        request: { query: TRANSACTIONS_QUERY },
        result: { data: { transactions: [SALARIO, JANTAR] } },
      },
    ])

    expect(await screen.findByRole('heading', { name: 'Saldo' })).toBeInTheDocument()
    expect(screen.getByText('R$ 4.239,95')).toBeInTheDocument()
    expect(screen.getByText('R$ 4.250,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 10,05')).toBeInTheDocument()
    expect(screen.getByText('Salário')).toBeInTheDocument()
    expect(screen.getByText('Jantar')).toBeInTheDocument()
    expect(screen.queryByText('Aluguel de Bruno')).not.toBeInTheDocument()
  })

  it('AC-002: no transactions show zero totals and an empty state', async () => {
    renderDashboard([
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
    ])

    expect(await screen.findByRole('region', { name: 'Resumo financeiro' })).toBeInTheDocument()
    expect(screen.getAllByText('R$ 0,00')).toHaveLength(3)
    expect(screen.getByText('Nenhuma movimentação ainda.')).toBeInTheDocument()
  })

  it('AC-003: a visitor cannot open private routes', async () => {
    renderApp({ initialPath: '/transacoes' })

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Transações' })).not.toBeInTheDocument()
  })

  it('AC-003: logout returns to login', async () => {
    const user = userEvent.setup()
    renderDashboard([
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
    ])

    await user.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(sessionStorage.getItem('financy.session')).toBeNull()
  })
})

import '@testing-library/jest-dom/vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { MockedProviderProps } from '@apollo/client/testing/react'
import { ME_QUERY } from '../auth/operations.ts'
import { CATEGORIES_QUERY } from '../categories/operations.ts'
import { writeToken } from '../../lib/session.ts'
import { renderApp } from '../../test/render-app.tsx'
import {
  CREATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  TRANSACTIONS_QUERY,
  UPDATE_TRANSACTION_MUTATION,
} from './operations.ts'

const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }
const MERCADO = { color: '#A1B2C3', createdAt: '2026-01-01T00:00:00.000Z', id: 'cat-mercado', name: 'Mercado' }

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

const TODAY = todayIsoDate()
const JANTAR = {
  amountInCents: 1005,
  category: { color: MERCADO.color, id: MERCADO.id, name: MERCADO.name },
  categoryId: MERCADO.id,
  createdAt: `${TODAY}T12:00:00.000Z`,
  description: 'Jantar',
  id: 'txn-jantar',
  occurredAt: `${TODAY}T12:00:00.000Z`,
  type: 'EXPENSE' as const,
}

afterEach(() => {
  sessionStorage.clear()
})

function meMock() {
  return { delay: 0, request: { query: ME_QUERY }, result: { data: { me: USER } } }
}

function renderFinance(
  path: string,
  mocks: MockedProviderProps['mocks'] = [],
) {
  writeToken('test-session-token')
  return renderApp({
    initialPath: path,
    mocks: [meMock(), ...mocks],
  })
}

describe('transactions page', () => {
  it('AC-001: converts 10,05 to 1005 and renders R$ 10,05', async () => {
    const user = userEvent.setup()
    renderFinance('/transacoes', [
      { delay: 0, request: { query: TRANSACTIONS_QUERY }, result: { data: { transactions: [] } } },
      { delay: 0, request: { query: CATEGORIES_QUERY }, result: { data: { categories: [MERCADO] } } },
      {
        delay: 0,
        request: {
          query: CREATE_TRANSACTION_MUTATION,
          variables: {
            input: {
              amountInCents: 1005,
              categoryId: MERCADO.id,
              description: 'Jantar',
              occurredAt: JANTAR.occurredAt,
              type: 'EXPENSE',
            },
          },
        },
        result: { data: { createTransaction: JANTAR } },
      },
    ])

    await user.click(await screen.findByRole('button', { name: 'Nova transação' }))
    await user.type(screen.getByLabelText('Descrição'), 'Jantar')
    await user.type(screen.getByLabelText('Valor'), '10,05')
    await user.selectOptions(screen.getByLabelText('Categoria'), MERCADO.id)
    await user.click(screen.getByRole('button', { name: 'Criar transação' }))

    expect(await screen.findByText('Jantar')).toBeInTheDocument()
    expect(screen.getByText('− R$ 10,05')).toBeInTheDocument()
  })

  it('AC-002: category is required and only session options are listed', async () => {
    const user = userEvent.setup()
    renderFinance('/transacoes', [
      { delay: 0, request: { query: TRANSACTIONS_QUERY }, result: { data: { transactions: [] } } },
      { delay: 0, request: { query: CATEGORIES_QUERY }, result: { data: { categories: [MERCADO] } } },
    ])

    await user.click(await screen.findByRole('button', { name: 'Nova transação' }))
    const category = screen.getByLabelText('Categoria')
    const options = within(category).getAllByRole('option').map((option) => option.textContent)

    expect(options).toEqual(['Selecione uma categoria', 'Mercado'])
    expect(options.join()).not.toContain('Aluguel de Bruno')

    await user.type(screen.getByLabelText('Descrição'), 'Jantar')
    await user.type(screen.getByLabelText('Valor'), '10,05')
    await user.click(screen.getByRole('button', { name: 'Criar transação' }))

    expect(await screen.findByText('Selecione uma categoria.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Nova transação' })).toBeInTheDocument()
  })

  it('AC-003: edit and delete update the list and the dashboard without duplicating rows', async () => {
    const user = userEvent.setup()
    const renamed = { ...JANTAR, description: 'Jantar no restaurante' }
    renderFinance('/transacoes', [
      { delay: 0, request: { query: TRANSACTIONS_QUERY }, result: { data: { transactions: [JANTAR] } } },
      { delay: 0, request: { query: CATEGORIES_QUERY }, result: { data: { categories: [MERCADO] } } },
      {
        delay: 0,
        request: {
          query: UPDATE_TRANSACTION_MUTATION,
          variables: {
            input: {
              amountInCents: 1005,
              categoryId: MERCADO.id,
              description: 'Jantar no restaurante',
              occurredAt: JANTAR.occurredAt,
              type: 'EXPENSE',
            },
            id: JANTAR.id,
          },
        },
        result: { data: { updateTransaction: renamed } },
      },
      {
        delay: 0,
        request: { query: DELETE_TRANSACTION_MUTATION, variables: { id: JANTAR.id } },
        result: { data: { deleteTransaction: true } },
      },
    ])

    expect(await screen.findByText('Jantar')).toBeInTheDocument()
    expect(screen.getAllByText('Jantar')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const description = screen.getByLabelText('Descrição')
    await user.clear(description)
    await user.type(description, 'Jantar no restaurante')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Jantar no restaurante')).toBeInTheDocument()
    expect(screen.queryByText('Jantar', { exact: true })).not.toBeInTheDocument()
    expect(screen.getAllByText('Jantar no restaurante')).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getAllByText('Jantar no restaurante')).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'Transações' }))
    await user.click(await screen.findByRole('button', { name: 'Excluir' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Nenhuma transação ainda.')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    expect(await screen.findByText('Nenhuma movimentação ainda.')).toBeInTheDocument()
    expect(screen.queryByText('Jantar no restaurante')).not.toBeInTheDocument()
  })
})

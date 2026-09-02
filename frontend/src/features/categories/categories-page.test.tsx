import '@testing-library/jest-dom/vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { afterEach, describe, expect, it } from 'vitest'
import { ME_QUERY } from '../auth/operations.ts'
import { writeToken } from '../../lib/session.ts'
import { renderApp } from '../../test/render-app.tsx'
import {
  CATEGORIES_QUERY,
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from './operations.ts'
import type { MockedProviderProps } from '@apollo/client/testing/react'

const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }
const MERCADO = {
  color: '#A1B2C3',
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'cat-mercado',
  name: 'Mercado',
}
const ALUGUEL = {
  color: null,
  createdAt: '2026-01-02T00:00:00.000Z',
  id: 'cat-aluguel',
  name: 'Aluguel',
}

afterEach(() => {
  sessionStorage.clear()
})

function meMock() {
  return {
    delay: 0,
    request: { query: ME_QUERY },
    result: { data: { me: USER } },
  }
}

function renderCategories(mocks: MockedProviderProps['mocks'] = []) {
  writeToken('test-session-token')
  return renderApp({
    initialPath: '/categorias',
    mocks: [meMock(), ...mocks],
  })
}

describe('categories page', () => {
  it('AC-001: creates, edits and deletes without leaving the page', async () => {
    const user = userEvent.setup()
    renderCategories([
      {
        delay: 0,
        request: { query: CATEGORIES_QUERY },
        result: { data: { categories: [] } },
      },
      {
        delay: 0,
        request: {
          query: CREATE_CATEGORY_MUTATION,
          variables: { input: { color: null, name: 'Mercado' } },
        },
        result: { data: { createCategory: MERCADO } },
      },
      {
        delay: 0,
        request: {
          query: UPDATE_CATEGORY_MUTATION,
          variables: { id: MERCADO.id, input: { color: '#A1B2C3', name: 'Mercado Extra' } },
        },
        result: {
          data: {
            updateCategory: { ...MERCADO, name: 'Mercado Extra' },
          },
        },
      },
      {
        delay: 0,
        request: {
          query: DELETE_CATEGORY_MUTATION,
          variables: { id: MERCADO.id },
        },
        result: { data: { deleteCategory: true } },
      },
    ])

    expect(await screen.findByText('Nenhuma categoria ainda.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }))
    await user.type(screen.getByLabelText('Nome'), 'Mercado')
    await user.click(screen.getByRole('button', { name: 'Criar categoria' }))

    expect(await screen.findByText('Mercado')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const name = screen.getByLabelText('Nome')
    await user.clear(name)
    await user.type(name, 'Mercado Extra')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Mercado Extra')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByText('Nenhuma categoria ainda.')).toBeInTheDocument()
  })

  it('AC-001: a conflict keeps the dialog and the typed name', async () => {
    const user = userEvent.setup()
    renderCategories([
      {
        delay: 0,
        request: { query: CATEGORIES_QUERY },
        result: { data: { categories: [ALUGUEL] } },
      },
      {
        delay: 0,
        request: {
          query: CREATE_CATEGORY_MUTATION,
          variables: { input: { color: null, name: 'Aluguel' } },
        },
        result: {
          errors: [
            new GraphQLError('A category with this name already exists.', {
              extensions: { code: 'CONFLICT' },
            }),
          ],
        },
      },
    ])

    await screen.findByText('Aluguel')
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }))
    await user.type(screen.getByLabelText('Nome'), 'Aluguel')
    await user.click(screen.getByRole('button', { name: 'Criar categoria' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma categoria com este nome.',
    )
    expect(screen.getByRole('dialog', { name: 'Nova categoria' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Aluguel')
  })

  it('AC-002: the dialog has an accessible name, closes on Escape and restores focus', async () => {
    const user = userEvent.setup()
    renderCategories([
      {
        delay: 0,
        request: { query: CATEGORIES_QUERY },
        result: { data: { categories: [] } },
      },
    ])

    const trigger = await screen.findByRole('button', { name: 'Nova categoria' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: 'Nova categoria' })
    expect(dialog).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toHaveFocus()
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('AC-003: a used category explains how to proceed instead of disappearing', async () => {
    const user = userEvent.setup()
    renderCategories([
      {
        delay: 0,
        request: { query: CATEGORIES_QUERY },
        result: { data: { categories: [MERCADO] } },
      },
      {
        delay: 0,
        request: {
          query: DELETE_CATEGORY_MUTATION,
          variables: { id: MERCADO.id },
        },
        result: {
          errors: [
            new GraphQLError('This category still has transactions.', {
              extensions: { code: 'CATEGORY_IN_USE' },
            }),
          ],
        },
      },
    ])

    expect(await screen.findByText('Mercado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta categoria ainda tem transações. Renomeie-a ou associe as transações a outra categoria antes de excluir.',
    )
    expect(screen.getByRole('dialog', { name: 'Excluir categoria' })).toBeInTheDocument()
    expect(screen.getByText('Mercado')).toBeInTheDocument()
  })
})

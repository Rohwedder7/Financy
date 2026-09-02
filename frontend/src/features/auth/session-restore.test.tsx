import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { afterEach, describe, expect, it } from 'vitest'
import { writeToken } from '../../lib/session.ts'
import { DASHBOARD_QUERY } from '../dashboard/operations.ts'
import { EMPTY_DASHBOARD } from '../dashboard/summarize.ts'
import { TRANSACTIONS_QUERY } from '../transactions/operations.ts'
import { ME_QUERY } from './operations.ts'
import { renderApp } from '../../test/render-app.tsx'

function dashboardMocks() {
  return [
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
  ]
}

const USER = { email: 'ana@financy.test', id: 'user-ana', name: 'Ana' }

afterEach(() => {
  sessionStorage.clear()
})

describe('session restoration', () => {
  it('restores the dashboard from sessionStorage without showing the token', async () => {
    writeToken('restored-session-token')

    renderApp({
      mocks: [
        {
          delay: 0,
          request: { query: ME_QUERY },
          result: { data: { me: USER } },
        },
        ...dashboardMocks(),
      ],
    })

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByText('restored-session-token')).not.toBeInTheDocument()
  })

  it('returns to login after logout and forgets the token', async () => {
    const user = userEvent.setup()
    writeToken('restored-session-token')

    renderApp({
      mocks: [
        {
          delay: 0,
          request: { query: ME_QUERY },
          result: { data: { me: USER } },
        },
        ...dashboardMocks(),
      ],
    })

    await user.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(sessionStorage.getItem('financy.session')).toBeNull()
  })

  it('treats an unauthenticated restoration as a guest', async () => {
    writeToken('expired-session-token')

    renderApp({
      mocks: [
        {
          delay: 0,
          request: { query: ME_QUERY },
          result: {
            errors: [
              new GraphQLError('Authentication is required.', {
                extensions: { code: 'UNAUTHENTICATED' },
              }),
            ],
          },
        },
      ],
    })

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })
})

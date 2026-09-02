import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { ME_QUERY, SIGN_IN_MUTATION } from '../features/auth/operations.ts'
import { createSessionErrorLink } from './apollo.ts'
import { clearToken, readToken, writeToken } from './session.ts'

describe('session error link', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('clears a stored token when a protected query is unauthenticated', async () => {
    writeToken('session-token')

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createSessionErrorLink(clearToken),
        new MockLink(
          [
            {
              request: { query: ME_QUERY },
              result: {
                errors: [
                  {
                    extensions: { code: 'UNAUTHENTICATED' },
                    message: 'Authentication is required.',
                  },
                ],
              },
            },
          ],
          { defaultOptions: { delay: 0 } },
        ),
      ]),
    })

    await expect(client.query({ query: ME_QUERY })).rejects.toBeTruthy()
    expect(readToken()).toBeNull()
  })

  it('keeps the session when sign-in reports unauthenticated credentials', async () => {
    writeToken('session-token')

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createSessionErrorLink(clearToken),
        new MockLink(
          [
            {
              request: {
                query: SIGN_IN_MUTATION,
                variables: { input: { email: 'ana@financy.test', password: 'x' } },
              },
              result: {
                errors: [
                  { extensions: { code: 'UNAUTHENTICATED' }, message: 'Invalid e-mail or password.' },
                ],
              },
            },
          ],
          { defaultOptions: { delay: 0 } },
        ),
      ]),
    })

    await expect(
      client.mutate({
        mutation: SIGN_IN_MUTATION,
        variables: { input: { email: 'ana@financy.test', password: 'x' } },
      }),
    ).rejects.toBeTruthy()

    expect(readToken()).toBe('session-token')
  })
})

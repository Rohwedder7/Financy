import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { describe, expect, it } from 'vitest'
import { authFailureMessage, graphqlErrorCode } from './graphql-error.ts'

function graphQLError(code: string, message = 'x') {
  return new CombinedGraphQLErrors({
    errors: [{ extensions: { code }, message }],
  })
}

describe('authFailureMessage', () => {
  it('never echoes a credential in a mapped message', () => {
    const password = 'correct horse battery'
    const message = authFailureMessage(
      graphQLError('UNAUTHENTICATED', `Invalid e-mail or password: ${password}`),
      'signIn',
    )

    expect(message).toBe('E-mail ou senha inválidos.')
    expect(message).not.toContain(password)
  })

  it('keeps conflict distinct from invalid credentials', () => {
    expect(authFailureMessage(graphQLError('CONFLICT'), 'signUp')).toBe(
      'Já existe uma conta com este e-mail.',
    )
  })

  it('reads the GraphQL error code', () => {
    expect(graphqlErrorCode(graphQLError('TOO_MANY_REQUESTS'))).toBe('TOO_MANY_REQUESTS')
  })
})

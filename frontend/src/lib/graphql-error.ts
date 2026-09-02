import { CombinedGraphQLErrors } from '@apollo/client/errors'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function graphqlErrorCode(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) {
    return undefined
  }

  const code = error.errors[0]?.extensions?.code
  return typeof code === 'string' ? code : undefined
}

export function authFailureMessage(error: unknown, kind: 'signIn' | 'signUp'): string {
  const code = graphqlErrorCode(error)

  if (code === 'CONFLICT') {
    return 'Já existe uma conta com este e-mail.'
  }

  if (code === 'TOO_MANY_REQUESTS') {
    return 'Muitas tentativas. Tente de novo em instantes.'
  }

  if (kind === 'signIn') {
    return 'E-mail ou senha inválidos.'
  }

  return 'Não foi possível criar a conta. Confira os dados e tente de novo.'
}

export function asAuthError(error: unknown, kind: 'signIn' | 'signUp'): AuthError {
  return error instanceof AuthError ? error : new AuthError(authFailureMessage(error, kind))
}

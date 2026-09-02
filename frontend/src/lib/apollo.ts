import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { graphqlErrorCode } from './graphql-error.ts'

const PUBLIC_OPERATIONS = new Set(['SignIn', 'SignUp'])

function graphqlUri(): string {
  const uri = import.meta.env.VITE_BACKEND_URL

  if (!uri) {
    throw new Error('VITE_BACKEND_URL is not configured.')
  }

  return uri
}

export function createSessionErrorLink(onUnauthenticated: () => void): ErrorLink {
  return new ErrorLink(({ error, operation }) => {
    if (PUBLIC_OPERATIONS.has(operation.operationName ?? '')) {
      return
    }

    if (graphqlErrorCode(error) === 'UNAUTHENTICATED') {
      onUnauthenticated()
    }
  })
}

export function createApolloClient(options: {
  getToken: () => string | null
  onUnauthenticated: () => void
}): ApolloClient {
  const authLink = new SetContextLink((previous) => {
    const token = options.getToken()
    const headers = (previous.headers ?? {}) as Record<string, string>

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  })

  return new ApolloClient({
    cache: new InMemoryCache(),
    devtools: { enabled: false },
    link: ApolloLink.from([
      createSessionErrorLink(options.onUnauthenticated),
      authLink,
      new HttpLink({ uri: graphqlUri() }),
    ]),
  })
}

CombinedGraphQLErrors.formatMessage = (errors) => errors.map((error) => error.message).join('\n')

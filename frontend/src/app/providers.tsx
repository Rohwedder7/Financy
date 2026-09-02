import { useState, type ReactNode } from 'react'
import { ApolloProvider } from '@apollo/client/react'
import { createApolloClient } from '../lib/apollo.ts'
import { clearToken, readToken } from '../lib/session.ts'
import { AuthProvider } from '../features/auth/auth-context.tsx'

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    createApolloClient({
      getToken: readToken,
      onUnauthenticated: clearToken,
    }),
  )

  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  )
}

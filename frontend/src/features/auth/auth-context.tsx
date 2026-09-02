import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { asAuthError, graphqlErrorCode } from '../../lib/graphql-error.ts'
import { clearToken, readToken, SESSION_CHANGED_EVENT, writeToken } from '../../lib/session.ts'
import {
  ME_QUERY,
  SIGN_IN_MUTATION,
  SIGN_UP_MUTATION,
  type AuthPayload,
  type AuthUser,
} from './operations.ts'
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from './schemas.ts'

export type AuthStatus = 'unknown' | 'guest' | 'authenticated'

interface AuthContextValue {
  signIn: (values: SignInValues) => Promise<void>
  signOut: () => void
  signUp: (values: SignUpValues) => Promise<void>
  status: AuthStatus
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient()
  const [token, setToken] = useState<string | null>(() => readToken())
  const [signInMutation] = useMutation<{ signIn: AuthPayload }>(SIGN_IN_MUTATION)
  const [signUpMutation] = useMutation<{ signUp: AuthPayload }>(SIGN_UP_MUTATION)
  const meQuery = useQuery<{ me: AuthUser }>(ME_QUERY, { skip: !token })

  useEffect(() => {
    const sync = () => setToken(readToken())
    window.addEventListener(SESSION_CHANGED_EVENT, sync)
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, sync)
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setToken(null)
    void client.clearStore()
  }, [client])

  const openSession = useCallback(
    (payload: AuthPayload) => {
      writeToken(payload.token)
      setToken(payload.token)
      client.writeQuery({ data: { me: payload.user }, query: ME_QUERY })
    },
    [client],
  )

  const signIn = useCallback(
    async (values: SignInValues) => {
      try {
        const result = await signInMutation({ variables: { input: signInSchema.parse(values) } })
        const payload = result.data?.signIn

        if (!payload) {
          throw asAuthError(undefined, 'signIn')
        }

        openSession(payload)
      } catch (error) {
        throw asAuthError(error, 'signIn')
      }
    },
    [openSession, signInMutation],
  )

  const signUp = useCallback(
    async (values: SignUpValues) => {
      try {
        const result = await signUpMutation({ variables: { input: signUpSchema.parse(values) } })
        const payload = result.data?.signUp

        if (!payload) {
          throw asAuthError(undefined, 'signUp')
        }

        openSession(payload)
      } catch (error) {
        throw asAuthError(error, 'signUp')
      }
    },
    [openSession, signUpMutation],
  )

  const status: AuthStatus = !token
    ? 'guest'
    : meQuery.data?.me
      ? 'authenticated'
      : meQuery.loading
        ? 'unknown'
        : graphqlErrorCode(meQuery.error) === 'UNAUTHENTICATED'
          ? 'guest'
          : 'unknown'

  const value = useMemo<AuthContextValue>(
    () => ({ signIn, signOut, signUp, status, user: meQuery.data?.me ?? null }),
    [meQuery.data?.me, signIn, signOut, signUp, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}

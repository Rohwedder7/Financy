import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../features/auth/auth-context.tsx'
import { SignInPage } from '../features/auth/sign-in-page.tsx'
import { SignUpPage } from '../features/auth/sign-up-page.tsx'
import { CategoriesPage } from '../features/categories/categories-page.tsx'
import { DashboardPage } from '../features/dashboard/dashboard-page.tsx'
import { TransactionsPage } from '../features/transactions/transactions-page.tsx'

export function SessionGate() {
  const { status } = useAuth()

  if (status === 'unknown') {
    return (
      <main className="grid min-h-screen place-items-center bg-financy-canvas text-financy-muted">
        <p role="status">Carregando sessão…</p>
      </main>
    )
  }

  return <Outlet />
}

export function HomePage() {
  const { status } = useAuth()

  return status === 'authenticated' ? <DashboardPage /> : <SignInPage />
}

export function SignUpRoute() {
  const { status } = useAuth()

  return status === 'authenticated' ? <Navigate replace to="/" /> : <SignUpPage />
}

export function RequireAuth() {
  const { status } = useAuth()

  return status === 'authenticated' ? <Outlet /> : <Navigate replace to="/" />
}

export function CategoriesRoute() {
  return <CategoriesPage />
}

export function TransactionsRoute() {
  return <TransactionsPage />
}

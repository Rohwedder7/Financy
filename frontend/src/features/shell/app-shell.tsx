import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../auth/auth-context.tsx'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white text-financy-ink' : 'text-financy-muted'}`

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-financy-canvas text-financy-ink">
      <header className="border-b border-financy-border bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-financy-green">
            Financy
          </p>
          <nav aria-label="Principal" className="flex items-center gap-1">
            <NavLink className={linkClass} end to="/">
              Dashboard
            </NavLink>
            <NavLink className={linkClass} to="/transacoes">
              Transações
            </NavLink>
            <NavLink className={linkClass} to="/categorias">
              Categorias
            </NavLink>
          </nav>
          <button
            className="rounded-xl border border-financy-border bg-white px-4 py-2 text-sm font-medium"
            onClick={signOut}
            type="button"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {user ? <p className="mt-2 text-financy-muted">Olá, {user.name}.</p> : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}

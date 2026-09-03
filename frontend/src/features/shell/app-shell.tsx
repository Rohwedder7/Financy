import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { BrandMark } from '../../components/brand-mark.tsx'
import { Button } from '../../components/button.tsx'
import { useAuth } from '../auth/auth-context.tsx'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-financy-green text-white' : 'text-financy-muted hover:text-financy-ink'
  }`

export function AppShell({
  children,
  figmaNode,
  title,
}: {
  children: ReactNode
  figmaNode: string
  title: string
}) {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-financy-canvas text-financy-ink" data-figma-node={figmaNode}>
      <header className="border-b border-financy-border bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <BrandMark />
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
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
          <Button onClick={signOut} type="button" variant="secondary">
            Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {user ? <p className="mt-2 text-financy-muted">Olá, {user.name}.</p> : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}

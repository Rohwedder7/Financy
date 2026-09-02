import type { ReactNode } from 'react'

export function AuthShell({
  children,
  footer,
  title,
}: {
  children: ReactNode
  footer: ReactNode
  title: string
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-financy-canvas px-6 text-financy-ink">
      <section className="w-full max-w-md rounded-2xl border border-financy-border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-financy-green">
          Financy
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-sm text-financy-muted">{footer}</div>
      </section>
    </main>
  )
}

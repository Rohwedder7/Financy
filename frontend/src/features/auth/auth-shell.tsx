import type { ReactNode } from 'react'
import { BrandMark } from '../../components/brand-mark.tsx'

export function AuthShell({
  children,
  figmaNode,
  footer,
  subtitle,
  title,
}: {
  children: ReactNode
  figmaNode: string
  footer: ReactNode
  subtitle: string
  title: string
}) {
  return (
    <main
      className="grid min-h-screen place-items-center bg-financy-canvas px-4 py-10 text-financy-ink sm:px-6"
      data-figma-node={figmaNode}
    >
      <div className="w-full max-w-md">
        <BrandMark className="mb-8 text-center" />
        <section className="rounded-2xl border border-financy-border bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-financy-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-sm text-financy-muted">{footer}</div>
        </section>
      </div>
    </main>
  )
}

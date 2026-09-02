function App() {
  const technologies = ['NestJS + GraphQL', 'React + Vite', 'Prisma + SQLite']

  return (
    <main className="grid min-h-screen place-items-center bg-financy-canvas px-6 text-financy-ink">
      <section className="w-full max-w-2xl rounded-2xl border border-financy-border bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-financy-green">
          Financy
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Foundation scaffold</h1>
        <p className="mt-4 max-w-xl text-financy-muted">
          The repository, GraphQL foundation and agentic harness are prepared. Product features are
          implemented and verified one approved SPEC at a time.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Foundation status">
          {technologies.map((technology) => (
            <div
              className="rounded-xl border border-financy-border bg-financy-canvas px-4 py-3 text-sm font-medium"
              key={technology}
            >
              {technology}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App

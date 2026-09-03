import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label: string
}

export function Field({ error, id, label, ...input }: FieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-financy-ink" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="rounded-xl border border-financy-border bg-white px-3 py-2.5 text-financy-ink outline-none transition-colors placeholder:text-financy-muted focus:border-financy-green aria-[invalid=true]:border-financy-danger"
        id={id}
        {...input}
      />
      {error ? (
        <p className="text-sm text-financy-danger" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

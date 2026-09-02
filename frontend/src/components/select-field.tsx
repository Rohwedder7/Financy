import type { SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  label: string
}

export function SelectField({ children, error, id, label, ...select }: SelectFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-financy-ink" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="rounded-xl border border-financy-border bg-white px-3 py-2 text-financy-ink outline-none focus:border-financy-green"
        id={id}
        {...select}
      >
        {children}
      </select>
      {error ? (
        <p className="text-sm text-red-700" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

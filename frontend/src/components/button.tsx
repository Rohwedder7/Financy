import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary: 'bg-financy-green text-white hover:bg-financy-brand-dark disabled:opacity-60',
  secondary:
    'border border-financy-border bg-white text-financy-ink hover:bg-financy-canvas disabled:opacity-60',
  danger: 'bg-financy-danger text-white hover:bg-financy-ink-soft disabled:opacity-60',
  ghost: 'text-financy-green hover:underline disabled:opacity-60',
} as const

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

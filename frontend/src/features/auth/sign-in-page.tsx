import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field } from '../../components/field.tsx'
import { useAuth } from './auth-context.tsx'
import { AuthShell } from './auth-shell.tsx'
import { signInSchema, type SignInValues } from './schemas.ts'

export function SignInPage() {
  const { signIn } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  return (
    <AuthShell
      title="Entrar"
      footer={
        <p>
          Não tem conta?{' '}
          <Link className="font-medium text-financy-green underline" to="/cadastro">
            Criar conta
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        noValidate
        onSubmit={handleSubmit(
          async (values) => {
            setFormError(null)
            try {
              await signIn(values)
            } catch (error) {
              setFormError(error instanceof Error ? error.message : 'E-mail ou senha inválidos.')
            }
          },
          (formErrors) => {
            const first = formErrors.email ? 'sign-in-email' : formErrors.password ? 'sign-in-password' : undefined
            if (first) {
              document.getElementById(first)?.focus()
            }
          },
        )}
      >
        {formError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {formError}
          </p>
        ) : null}
        <Field
          autoComplete="email"
          error={errors.email?.message}
          id="sign-in-email"
          label="E-mail"
          type="email"
          {...register('email')}
        />
        <Field
          autoComplete="current-password"
          error={errors.password?.message}
          id="sign-in-password"
          label="Senha"
          type="password"
          {...register('password')}
        />
        <button
          className="rounded-xl bg-financy-green px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          Entrar
        </button>
      </form>
    </AuthShell>
  )
}

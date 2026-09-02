import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field } from '../../components/field.tsx'
import { useAuth } from './auth-context.tsx'
import { AuthShell } from './auth-shell.tsx'
import { signUpSchema, type SignUpValues } from './schemas.ts'

export function SignUpPage() {
  const { signUp } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  })

  return (
    <AuthShell
      title="Criar conta"
      footer={
        <p>
          Já tem conta?{' '}
          <Link className="font-medium text-financy-green underline" to="/">
            Entrar
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
              await signUp(values)
            } catch (error) {
              setFormError(
                error instanceof Error
                  ? error.message
                  : 'Não foi possível criar a conta. Confira os dados e tente de novo.',
              )
            }
          },
          (formErrors) => {
            const first = formErrors.name
              ? 'sign-up-name'
              : formErrors.email
                ? 'sign-up-email'
                : formErrors.password
                  ? 'sign-up-password'
                  : undefined
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
          autoComplete="name"
          error={errors.name?.message}
          id="sign-up-name"
          label="Nome"
          {...register('name')}
        />
        <Field
          autoComplete="email"
          error={errors.email?.message}
          id="sign-up-email"
          label="E-mail"
          type="email"
          {...register('email')}
        />
        <Field
          autoComplete="new-password"
          error={errors.password?.message}
          id="sign-up-password"
          label="Senha"
          type="password"
          {...register('password')}
        />
        <button
          className="rounded-xl bg-financy-green px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          Criar conta
        </button>
      </form>
    </AuthShell>
  )
}

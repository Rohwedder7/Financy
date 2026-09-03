import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/button.tsx'
import { Field } from '../../components/field.tsx'
import { useAuth } from './auth-context.tsx'
import { figmaFrames } from '../../theme/figma-frames.ts'
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
      figmaNode={figmaFrames.signUp}
      subtitle="Preencha os campos abaixo para começar."
      title="Criar conta"
      footer={
        <p>
          Já tem conta?{' '}
          <Link className="font-medium text-financy-green" to="/">
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
          <p
            className="rounded-lg bg-financy-danger/10 px-3 py-2 text-sm text-financy-danger"
            role="alert"
          >
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
        <Button className="w-full" disabled={isSubmitting} type="submit">
          Criar conta
        </Button>
      </form>
    </AuthShell>
  )
}

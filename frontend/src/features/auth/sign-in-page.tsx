import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/button.tsx'
import { Field } from '../../components/field.tsx'
import { useAuth } from './auth-context.tsx'
import { figmaFrames } from '../../theme/figma-frames.ts'
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
      figmaNode={figmaFrames.login}
      subtitle="Entre com seu e-mail e senha para acessar sua conta."
      title="Entrar"
      footer={
        <p>
          Não tem uma conta?{' '}
          <Link className="font-medium text-financy-green" to="/cadastro">
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
            const first = formErrors.email
              ? 'sign-in-email'
              : formErrors.password
                ? 'sign-in-password'
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
          autoComplete="email"
          error={errors.email?.message}
          id="sign-in-email"
          label="E-mail"
          placeholder="mail@exemplo.com"
          type="email"
          {...register('email')}
        />
        <Field
          autoComplete="current-password"
          error={errors.password?.message}
          id="sign-in-password"
          label="Senha"
          placeholder="Digite sua senha"
          type="password"
          {...register('password')}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          Entrar
        </Button>
      </form>
    </AuthShell>
  )
}

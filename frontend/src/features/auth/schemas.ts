import { z } from 'zod'
import { normalizeEmail } from '../../lib/email.ts'

export const signInSchema = z.object({
  email: z.email('Informe um e-mail válido.').transform(normalizeEmail),
  password: z.string().min(1, 'Informe a senha.'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(120, 'O nome é longo demais.'),
  email: z.email('Informe um e-mail válido.').transform(normalizeEmail),
  password: z
    .string()
    .min(8, 'A senha precisa de pelo menos 8 caracteres.')
    .max(128, 'A senha é longa demais.'),
})

export type SignInValues = z.input<typeof signInSchema>
export type SignUpValues = z.input<typeof signUpSchema>

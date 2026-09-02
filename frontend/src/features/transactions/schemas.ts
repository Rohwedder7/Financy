import { z } from 'zod'
import { occurredAtFromDateInput, parseLocalizedAmountToCents } from '../../lib/money.ts'

export const transactionSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor.')
    .refine((value) => parseLocalizedAmountToCents(value) !== null, 'Informe um valor válido, como 10,05.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  description: z.string().trim().min(1, 'Informe a descrição.').max(200, 'A descrição é longa demais.'),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data.'),
  type: z.enum(['EXPENSE', 'INCOME'], { error: 'Selecione o tipo.' }),
})

export type TransactionValues = z.input<typeof transactionSchema>

export function toTransactionInput(values: TransactionValues): {
  amountInCents: number
  categoryId: string
  description: string
  occurredAt: string
  type: 'EXPENSE' | 'INCOME'
} {
  const parsed = transactionSchema.parse(values)
  const amountInCents = parseLocalizedAmountToCents(parsed.amount)

  if (amountInCents === null) {
    throw new Error('Informe um valor válido, como 10,05.')
  }

  return {
    amountInCents,
    categoryId: parsed.categoryId,
    description: parsed.description,
    occurredAt: occurredAtFromDateInput(parsed.occurredOn),
    type: parsed.type,
  }
}

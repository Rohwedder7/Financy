import { z } from 'zod'

const hexColor = /^#[0-9A-Fa-f]{6}$/

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(80, 'O nome é longo demais.'),
  color: z
    .string()
    .trim()
    .transform((value) => (value === '' ? '' : value.toUpperCase()))
    .refine((value) => value === '' || hexColor.test(value), 'Informe uma cor no formato #RRGGBB.'),
})

export type CategoryValues = z.input<typeof categorySchema>

export function toCategoryInput(values: CategoryValues): { color?: string | null; name: string } {
  const parsed = categorySchema.parse(values)
  return {
    name: parsed.name,
    color: parsed.color === '' ? null : parsed.color,
  }
}

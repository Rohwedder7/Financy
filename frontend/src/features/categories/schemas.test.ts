import { describe, expect, it } from 'vitest'
import { categorySchema, toCategoryInput } from './schemas.ts'

describe('categorySchema', () => {
  it('accepts a blank colour as absent', () => {
    expect(toCategoryInput({ name: ' Mercado ', color: '  ' })).toEqual({
      color: null,
      name: 'Mercado',
    })
  })

  it('uppercases a valid hex colour', () => {
    expect(toCategoryInput({ name: 'Aluguel', color: '#a1b2c3' })).toEqual({
      color: '#A1B2C3',
      name: 'Aluguel',
    })
  })

  it('rejects a short hex value', () => {
    expect(categorySchema.safeParse({ name: 'Aluguel', color: '#fff' }).success).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './schemas.ts'

describe('signUpSchema', () => {
  it('rejects a password shorter than eight characters', () => {
    const result = signUpSchema.safeParse({
      email: 'ana@financy.test',
      name: 'Ana',
      password: '1234567',
    })

    expect(result.success).toBe(false)
  })

  it('accepts a valid payload', () => {
    expect(
      signUpSchema.parse({
        email: 'ana@financy.test',
        name: ' Ana ',
        password: 'correct horse',
      }),
    ).toMatchObject({ name: 'Ana' })
  })
})

describe('signInSchema', () => {
  it('requires a password without disclosing the length policy', () => {
    const empty = signInSchema.safeParse({ email: 'ana@financy.test', password: '' })
    const short = signInSchema.safeParse({ email: 'ana@financy.test', password: 'short' })

    expect(empty.success).toBe(false)
    expect(short.success).toBe(true)
  })
})

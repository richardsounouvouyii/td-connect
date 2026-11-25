import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/features/auth/schemas/loginSchema'

describe('loginSchema', () => {
  it('accepte un e-mail et un mot de passe valides', () => {
    const result = loginSchema.safeParse({
      email: 'Eleve@Demo.TD',
      password: 'demo1234',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('eleve@demo.td')
    }
  })

  it('refuse un e-mail invalide', () => {
    const result = loginSchema.safeParse({
      email: 'pas-un-email',
      password: 'demo1234',
    })

    expect(result.success).toBe(false)
  })

  it('refuse un mot de passe trop court', () => {
    const result = loginSchema.safeParse({
      email: 'eleve@demo.td',
      password: 'short',
    })

    expect(result.success).toBe(false)
  })
})

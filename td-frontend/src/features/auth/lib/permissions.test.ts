import { describe, expect, it } from 'vitest'
import { isRoleAllowed } from '@/features/auth/lib/permissions'

describe('isRoleAllowed', () => {
  it('autorise le rôle listé', () => {
    expect(isRoleAllowed('STUDENT', ['STUDENT'])).toBe(true)
  })

  it('refuse un autre rôle', () => {
    expect(isRoleAllowed('TRAINER', ['STUDENT'])).toBe(false)
  })

  it('refuse une session vide', () => {
    expect(isRoleAllowed(null, ['STUDENT'])).toBe(false)
    expect(isRoleAllowed(undefined, ['STUDENT'])).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { homePathForRole } from '@/features/auth/lib/home-by-role'

describe('homePathForRole', () => {
  it('renvoie la route d’accueil de chaque rôle', () => {
    expect(homePathForRole('STUDENT')).toBe('/eleve')
    expect(homePathForRole('TRAINER')).toBe('/formateur')
    expect(homePathForRole('SCHOOL_ADMIN')).toBe('/admin-etablissement')
    expect(homePathForRole('SUPER_ADMIN')).toBe('/super-admin')
  })
})

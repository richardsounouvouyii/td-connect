import type { Role } from '@/lib/auth/roles'

/** Profil minimal renvoyé par GET /me (contrat à aligner avec l'API plus tard). */
export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: Role
  /** Présent pour élève / formateur / admin école ; absent pour SUPER_ADMIN global. */
  establishmentId: string | null
  establishmentName: string | null
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthState = {
  status: AuthStatus
  user: AuthUser | null
}

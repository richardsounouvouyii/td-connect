import type { Role } from '@/lib/auth/roles'

/** Route d'accueil après connexion, selon le rôle. */
export function homePathForRole(role: Role): string {
  switch (role) {
    case 'STUDENT':
      return '/eleve'
    case 'TRAINER':
      return '/formateur'
    case 'SCHOOL_ADMIN':
      return '/admin-etablissement'
    case 'SUPER_ADMIN':
      return '/super-admin'
  }
}

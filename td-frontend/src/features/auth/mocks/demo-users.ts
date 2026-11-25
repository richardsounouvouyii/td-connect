import type { AuthUser } from '@/features/auth/types'

/**
 * Comptes de démo UNIQUEMENT si VITE_ENABLE_MOCKS=true.
 * Mot de passe commun volontairement simple pour le front sans API.
 */
export const MOCK_PASSWORD = 'demo1234'

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'user-student-1',
    email: 'eleve@demo.td',
    fullName: 'Amina Élève',
    role: 'STUDENT',
    establishmentId: 'est-1',
    establishmentName: 'Lycée Démo Porto-Novo',
  },
  {
    id: 'user-trainer-1',
    email: 'formateur@demo.td',
    fullName: 'Jean Formateur',
    role: 'TRAINER',
    establishmentId: 'est-1',
    establishmentName: 'Lycée Démo Porto-Novo',
  },
  {
    id: 'user-admin-1',
    email: 'admin@demo.td',
    fullName: 'Claire Admin',
    role: 'SCHOOL_ADMIN',
    establishmentId: 'est-1',
    establishmentName: 'Lycée Démo Porto-Novo',
  },
  {
    id: 'user-super-1',
    email: 'super@demo.td',
    fullName: 'Sam Super',
    role: 'SUPER_ADMIN',
    establishmentId: null,
    establishmentName: null,
  },
]

export function findDemoUser(email: string): AuthUser | undefined {
  return DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  )
}

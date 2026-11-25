import type { Role } from '@/lib/auth/roles'
import { isRoleAllowed } from '@/features/auth/lib/permissions'
import { homePathForRole } from '@/features/auth/lib/home-by-role'

export const PATH_ALLOWED_ROLES: Record<string, readonly Role[]> = {
  '/eleve': ['STUDENT'],
  '/formateur': ['TRAINER'],
  '/admin-etablissement': ['SCHOOL_ADMIN'],
  '/super-admin': ['SUPER_ADMIN'],
}

/** Cible après connexion : URL d'origine si autorisée, sinon accueil du rôle. */
export function resolvePostLoginPath(
  role: Role,
  fromPath: string | null,
): string {
  if (!fromPath) return homePathForRole(role)

  const allowed = PATH_ALLOWED_ROLES[fromPath]
  if (allowed && isRoleAllowed(role, allowed)) {
    return fromPath
  }

  return homePathForRole(role)
}

export function readFromPath(state: unknown): string | null {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  ) {
    return state.from
  }
  return null
}

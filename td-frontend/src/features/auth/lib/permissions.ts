import type { Role } from '@/lib/auth/roles'

/** Vérifie si le rôle de session peut ouvrir une zone donnée. */
export function isRoleAllowed(
  userRole: Role | null | undefined,
  allowedRoles: readonly Role[],
): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useAuth } from '@/features/auth/context/AuthContext'
import { isRoleAllowed } from '@/features/auth/lib/permissions'
import type { Role } from '@/lib/auth/roles'

type ProtectedRouteProps = {
  allowedRoles: readonly Role[]
}

/**
 * Garde d'accès UX :
 * - anonyme → /connexion
 * - mauvais rôle → /acces-refuse
 * La sécurité réelle reste côté API.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="px-4 py-16">
        <LoadingState label="Vérification de la session…" />
      </div>
    )
  }

  if (status !== 'authenticated' || !user) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (!isRoleAllowed(user.role, allowedRoles)) {
    return <Navigate to="/acces-refuse" replace />
  }

  return <Outlet />
}

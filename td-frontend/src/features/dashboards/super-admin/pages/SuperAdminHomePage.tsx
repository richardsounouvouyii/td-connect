import { superAdminNav } from '@/components/navigation/super-admin/nav'
import { useAuth } from '@/features/auth/context/AuthContext'
import { RoleHomeView } from '@/features/dashboards/shared/RoleHomeView'

/** Accueil espace SUPER ADMIN. */
export function SuperAdminHomePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <RoleHomeView
      roleTitle="Espace super administrateur"
      fullName={user.fullName}
      establishmentLabel="Vue globale multi-établissements"
      shortcuts={superAdminNav.filter((item) => item.to !== '/super-admin')}
    />
  )
}

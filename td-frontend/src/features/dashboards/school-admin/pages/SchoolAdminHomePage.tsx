import { schoolAdminNav } from '@/components/navigation/school-admin/nav'
import { useAuth } from '@/features/auth/context/AuthContext'
import { RoleHomeView } from '@/features/dashboards/shared/RoleHomeView'

/** Accueil espace ADMIN ÉTABLISSEMENT. */
export function SchoolAdminHomePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <RoleHomeView
      roleTitle="Espace administrateur d’établissement"
      fullName={user.fullName}
      establishmentLabel={
        user.establishmentName
          ? `Établissement : ${user.establishmentName}`
          : 'Établissement non renseigné'
      }
      shortcuts={schoolAdminNav.filter(
        (item) => item.to !== '/admin-etablissement',
      )}
    />
  )
}

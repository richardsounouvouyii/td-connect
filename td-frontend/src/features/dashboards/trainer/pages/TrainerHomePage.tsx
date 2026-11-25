import { trainerNav } from '@/components/navigation/trainer/nav'
import { useAuth } from '@/features/auth/context/AuthContext'
import { RoleHomeView } from '@/features/dashboards/shared/RoleHomeView'

/** Accueil espace FORMATEUR. */
export function TrainerHomePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <RoleHomeView
      roleTitle="Espace formateur"
      fullName={user.fullName}
      establishmentLabel={
        user.establishmentName
          ? `Établissement : ${user.establishmentName}`
          : 'Affectations multi-établissements'
      }
      shortcuts={trainerNav.filter((item) => item.to !== '/formateur')}
    />
  )
}

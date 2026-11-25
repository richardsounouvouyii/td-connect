import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/context/AuthContext'
import { homePathForRole } from '@/features/auth/lib/home-by-role'

export function ForbiddenPage() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
      <p className="text-sm font-semibold tracking-wide text-error uppercase">
        Accès refusé
      </p>
      <h1 className="font-display text-3xl font-semibold">
        Vous n’avez pas le droit d’ouvrir cette page
      </h1>
      <p className="text-base-content/90">
        Cette zone est réservée à un autre rôle. Si vous pensez qu’il s’agit
        d’une erreur, contactez l’administrateur de votre établissement.
      </p>

      <div className="flex flex-wrap gap-3">
        {user ? (
          <Link to={homePathForRole(user.role)}>
            <Button>Retour à mon espace</Button>
          </Link>
        ) : (
          <Link to="/connexion">
            <Button>Se connecter</Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="outline">Accueil</Button>
        </Link>
        {user ? (
          <Button variant="ghost" onClick={logout}>
            Se déconnecter
          </Button>
        ) : null}
      </div>
    </div>
  )
}

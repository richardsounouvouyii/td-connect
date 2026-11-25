import { Link, Navigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  readFromPath,
  resolvePostLoginPath,
} from '@/features/auth/lib/route-access'

export function LoginPage() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'authenticated' && user) {
    return (
      <Navigate
        to={resolvePostLoginPath(user.role, readFromPath(location.state))}
        replace
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-3 sm:px-0 sm:py-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Connexion
        </h1>
        <p className="mt-2 text-base text-base-content/90">
          Accédez à votre espace TD CONNECT avec les identifiants fournis par
          votre établissement.
        </p>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-sm sm:p-4">
        <LoginForm />
      </div>

      <p className="text-center text-sm text-base-content/90">
        <Link to="/" className="link link-primary">
          Retour à l’accueil
        </Link>
      </p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { NavItem } from '@/components/navigation/types'

type RoleHomeViewProps = {
  roleTitle: string
  fullName: string
  establishmentLabel: string
  shortcuts: NavItem[]
}

/** Présentation commune — utilisée par chaque page d’accueil de rôle. */
export function RoleHomeView({
  roleTitle,
  fullName,
  establishmentLabel,
  shortcuts,
}: RoleHomeViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          {roleTitle}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Bonjour, {fullName}
        </h1>
        <p className="mt-2 text-base-content/90">{establishmentLabel}</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold">Accès rapides</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 transition hover:border-primary/40 hover:bg-base-200/60"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

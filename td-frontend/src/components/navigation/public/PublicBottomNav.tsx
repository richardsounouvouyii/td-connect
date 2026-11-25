/**
 * Barre du bas — page PUBLIQUE uniquement (présentation / démo).
 */
import {
  GraduationCap,
  Home,
  LogIn,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'

const items = [
  { to: '/#accueil', hash: 'accueil', label: 'Accueil', icon: Home },
  {
    to: '/#fonctionnalites',
    hash: 'fonctionnalites',
    label: 'Offre',
    icon: Sparkles,
  },
  { to: '/#pour-qui', hash: 'pour-qui', label: 'Publics', icon: Users },
  {
    to: '/#essayer',
    hash: 'essayer',
    label: 'Essayer',
    icon: GraduationCap,
  },
  { to: '/connexion', hash: null, label: 'Connexion', icon: LogIn },
] as const

export function PublicBottomNav() {
  const { pathname, hash } = useLocation()
  const currentHash = hash.replace('#', '')

  return (
    <nav
      aria-label="Navigation publique mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch gap-0.5 px-1.5 py-1.5">
        {items.map(({ to, hash: itemHash, label, icon: Icon }) => {
          const isRoute = itemHash === null
          const isActive = isRoute
            ? pathname === '/connexion'
            : pathname === '/' &&
              (currentHash === itemHash ||
                (itemHash === 'accueil' && currentHash === ''))

          return (
            <li key={to} className="min-w-0 flex-1">
              <Link
                to={to}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition',
                  isActive
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-base-content/80 hover:bg-base-200',
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Topbar PARTAGÉE (tous les rôles).
 * Le contenu (nom, rôle) vient de la session ; le menu dépend du layout.
 */
import { Bell, GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/features/auth/types'

type TopbarProps = {
  user: AuthUser
  menuOpen: boolean
  onToggleMenu: () => void
  onLogout: () => void
  showMenuButton: boolean
  /** Lien cloche Alertes (ex. formateur) — hors barre mobile. */
  alertsTo?: string
  alertsUnreadCount?: number
}

const roleLabel = {
  STUDENT: 'Élève',
  TRAINER: 'Formateur',
  SCHOOL_ADMIN: 'Admin établissement',
  SUPER_ADMIN: 'Super admin',
} as const

function formatBadge(count: number): string {
  return count > 9 ? '9+' : String(count)
}

export function Topbar({
  user,
  menuOpen,
  onToggleMenu,
  onLogout,
  showMenuButton,
  alertsTo,
  alertsUnreadCount = 0,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-base-300/80 bg-base-100/95 backdrop-blur-md">
      <div className="flex h-[3.75rem] items-center justify-between gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {showMenuButton ? (
            <button
              type="button"
              className="btn btn-ghost btn-square min-h-11 min-w-11 lg:hidden"
              onClick={onToggleMenu}
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          ) : null}

          <Link
            to="/"
            className="flex min-h-11 min-w-0 items-center gap-2 text-primary"
          >
            <GraduationCap className="size-5 shrink-0" aria-hidden />
            <span className="truncate font-display text-base font-semibold tracking-tight">
              TD CONNECT
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {alertsTo ? (
            <Link
              to={alertsTo}
              className="btn btn-ghost btn-square relative min-h-11 min-w-11"
              aria-label={
                alertsUnreadCount > 0
                  ? `Alertes, ${alertsUnreadCount} non lue${alertsUnreadCount > 1 ? 's' : ''}`
                  : 'Alertes'
              }
            >
              <Bell className="size-5" aria-hidden />
              {alertsUnreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] leading-none font-semibold text-error-content">
                  {formatBadge(alertsUnreadCount)}
                </span>
              ) : null}
            </Link>
          ) : null}

          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-base-content/60">
              {roleLabel[user.role]}
              {user.establishmentName ? ` · ${user.establishmentName}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-11 gap-2"
            onClick={onLogout}
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  )
}

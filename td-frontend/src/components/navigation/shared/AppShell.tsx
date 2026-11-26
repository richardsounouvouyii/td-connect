/**
 * Coquille PARTAGÉE : Topbar + Sidebar sticky + BottomNav + footer court.
 */
import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { PwaInstallHint } from '@/components/feedback/PwaInstallHint'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { navItemsForRole } from '@/components/navigation/nav-config'
import { MobileBottomNav } from '@/components/navigation/shared/MobileBottomNav'
import { Sidebar } from '@/components/navigation/shared/Sidebar'
import { SiteFooter } from '@/components/navigation/shared/SiteFooter'
import { Topbar } from '@/components/navigation/shared/Topbar'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useUnreadAlertCount } from '@/features/dashboards/student/lib/use-unread-alert-count'
import { useUnreadTrainerAlertCount } from '@/features/dashboards/trainer/lib/use-unread-trainer-alert-count'
import type { Role } from '@/lib/auth/roles'

type AppShellProps = {
  useBottomNav?: boolean
}

function logoutSpaceLabel(role: Role): string {
  switch (role) {
    case 'STUDENT':
      return 'espace élève'
    case 'TRAINER':
      return 'espace formateur'
    case 'SCHOOL_ADMIN':
      return 'espace admin établissement'
    case 'SUPER_ADMIN':
      return 'espace super admin'
  }
}

export function AppShell({ useBottomNav = false }: AppShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const studentUnread = useUnreadAlertCount()
  const trainerUnread = useUnreadTrainerAlertCount()

  const items = useMemo(() => {
    if (!user) return []
    const base = navItemsForRole(user.role)
    if (user.role === 'STUDENT' && studentUnread > 0) {
      return base.map((item) =>
        item.to === '/eleve/notifications'
          ? { ...item, badge: studentUnread }
          : item,
      )
    }
    if (user.role === 'TRAINER' && trainerUnread > 0) {
      return base.map((item) =>
        item.to === '/formateur/notifications'
          ? { ...item, badge: trainerUnread }
          : item,
      )
    }
    return base
  }, [user, studentUnread, trainerUnread])

  if (!user) return null

  const confirmLogout = () => {
    setLogoutOpen(false)
    logout()
    void navigate('/connexion', { replace: true })
  }

  const trainerAlerts =
    user.role === 'TRAINER'
      ? {
          alertsTo: '/formateur/notifications',
          alertsUnreadCount: trainerUnread,
        }
      : {}

  return (
    <div className="flex min-h-dvh flex-col bg-base-100">
      <Topbar
        user={user}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onLogout={() => setLogoutOpen(true)}
        showMenuButton={!useBottomNav}
        {...trainerAlerts}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1">
        {useBottomNav ? (
          <Sidebar items={items} mode="static" />
        ) : (
          <>
            {menuOpen ? (
              <button
                type="button"
                className="fixed inset-0 z-30 bg-base-content/30 lg:hidden"
                aria-label="Fermer le menu"
                onClick={() => setMenuOpen(false)}
              />
            ) : null}
            <Sidebar
              id="app-sidebar"
              items={items}
              mode="drawer"
              open={menuOpen}
              onNavigate={() => setMenuOpen(false)}
            />
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
            <Outlet />
          </main>

          <SiteFooter withBottomNav={useBottomNav} className="mt-auto" />
        </div>
      </div>

      {useBottomNav ? <MobileBottomNav items={items} /> : null}
      <PwaInstallHint />

      <ConfirmDialog
        open={logoutOpen}
        title="Se déconnecter ?"
        message={`Vous devrez vous reconnecter pour accéder à votre ${logoutSpaceLabel(user.role)}.`}
        confirmLabel="Déconnexion"
        cancelLabel="Rester connecté"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}

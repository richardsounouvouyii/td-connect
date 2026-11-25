/**
 * Coquille PARTAGÉE : Topbar + Sidebar sticky + BottomNav + footer court.
 */
import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { PwaInstallHint } from '@/components/feedback/PwaInstallHint'
import { navItemsForRole } from '@/components/navigation/nav-config'
import { MobileBottomNav } from '@/components/navigation/shared/MobileBottomNav'
import { Sidebar } from '@/components/navigation/shared/Sidebar'
import { SiteFooter } from '@/components/navigation/shared/SiteFooter'
import { Topbar } from '@/components/navigation/shared/Topbar'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useUnreadAlertCount } from '@/features/dashboards/student/lib/use-unread-alert-count'

type AppShellProps = {
  useBottomNav?: boolean
}

export function AppShell({ useBottomNav = false }: AppShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const unreadAlerts = useUnreadAlertCount()

  const items = useMemo(() => {
    if (!user) return []
    const base = navItemsForRole(user.role)
    if (user.role !== 'STUDENT' || unreadAlerts <= 0) return base
    return base.map((item) =>
      item.to === '/eleve/notifications'
        ? { ...item, badge: unreadAlerts }
        : item,
    )
  }, [user, unreadAlerts])

  if (!user) return null

  const handleLogout = () => {
    logout()
    void navigate('/connexion', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-base-100">
      <Topbar
        user={user}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onLogout={handleLogout}
        showMenuButton={!useBottomNav}
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
    </div>
  )
}

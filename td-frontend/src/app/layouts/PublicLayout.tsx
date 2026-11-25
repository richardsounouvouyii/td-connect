import { GraduationCap } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PwaInstallHint } from '@/components/feedback/PwaInstallHint'
import { PublicBottomNav } from '@/components/navigation/public/PublicBottomNav'
import { SiteFooter } from '@/components/navigation/shared/SiteFooter'

export function PublicLayout() {
  const { pathname } = useLocation()
  const showBottomNav = pathname === '/' || pathname === '/connexion'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-base-300/80 bg-base-100/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-base-100/75">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 text-primary transition-opacity hover:opacity-80"
          >
            <GraduationCap className="size-6 shrink-0" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">
              TD CONNECT
            </span>
          </Link>
          <nav aria-label="Navigation publique" className="hidden sm:block">
            <Link to="/connexion" className="btn btn-primary btn-sm min-h-11 px-5">
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter withBottomNav={showBottomNav} />

      {showBottomNav ? <PublicBottomNav /> : null}
      <PwaInstallHint />
    </div>
  )
}

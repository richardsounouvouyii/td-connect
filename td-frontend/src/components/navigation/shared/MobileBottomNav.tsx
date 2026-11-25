/**
 * Bottom nav PARTAGÉE (surtout utilisée par l’élève via AppShell useBottomNav).
 */
import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/components/navigation/types'
import { cn } from '@/lib/cn'

type MobileBottomNavProps = {
  items: NavItem[]
}

function formatBadge(count: number): string {
  return count > 9 ? '9+' : String(count)
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const mobileItems = items.filter((item) => item.mobile).slice(0, 5)

  if (mobileItems.length === 0) return null

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {mobileItems.map(({ to, label, icon: Icon, badge }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to.split('/').length <= 2}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                  isActive ? 'text-primary' : 'text-base-content/55',
                )
              }
            >
              <span className="relative inline-flex">
                <Icon className="size-5" aria-hidden />
                {badge && badge > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] leading-none font-semibold text-error-content"
                    aria-label={`${badge} non lue${badge > 1 ? 's' : ''}`}
                  >
                    {formatBadge(badge)}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

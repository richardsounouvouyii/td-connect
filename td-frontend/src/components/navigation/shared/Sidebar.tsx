/**
 * Sidebar PARTAGÉE (chrome UI).
 * sticky sur desktop pour ne pas scroller avec le contenu.
 */
import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/components/navigation/types'
import { cn } from '@/lib/cn'

type SidebarProps = {
  items: NavItem[]
  mode?: 'drawer' | 'static'
  open?: boolean
  onNavigate?: () => void
  id?: string
}

function formatBadge(count: number): string {
  return count > 9 ? '9+' : String(count)
}

export function Sidebar({
  items,
  mode = 'static',
  open = true,
  onNavigate,
  id,
}: SidebarProps) {
  return (
    <aside
      id={id}
      className={cn(
        'w-64 shrink-0 border-r border-base-300 bg-base-100',
        mode === 'drawer' &&
          'fixed inset-y-0 left-0 z-40 pt-[3.75rem] transition-transform duration-200 lg:sticky lg:top-[3.75rem] lg:z-20 lg:h-[calc(100dvh-3.75rem)] lg:translate-x-0 lg:self-start lg:overflow-y-auto lg:pt-0',
        mode === 'drawer' && (open ? 'translate-x-0' : '-translate-x-full'),
        mode === 'static' &&
          'sticky top-[3.75rem] z-20 hidden h-[calc(100dvh-3.75rem)] self-start overflow-y-auto lg:block',
      )}
    >
      <nav
        aria-label="Navigation principale"
        className="flex h-full flex-col overflow-y-auto p-3"
      >
        <ul className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to.split('/').length <= 2}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content/90 hover:bg-base-200',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{label}</span>
                    {badge && badge > 0 ? (
                      <span
                        className={cn(
                          'flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-semibold',
                          isActive
                            ? 'bg-primary-content text-primary'
                            : 'bg-error text-error-content',
                        )}
                        aria-label={`${badge} non lue${badge > 1 ? 's' : ''}`}
                      >
                        {formatBadge(badge)}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

import {
  sessionStatusClass,
  sessionStatusLabel,
} from '@/features/dashboards/student/lib/format'
import type { SessionStatus } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

type SessionStatusBadgeProps = {
  status: SessionStatus
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
        sessionStatusClass(status),
      )}
    >
      {sessionStatusLabel(status)}
    </span>
  )
}

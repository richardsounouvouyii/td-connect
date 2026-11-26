import {
  adminSessionStatusClass,
  adminSessionStatusLabel,
} from '@/features/dashboards/school-admin/lib/format'
import type { AdminSessionStatus } from '@/features/dashboards/school-admin/types'
import { cn } from '@/lib/cn'

type AdminSessionStatusBadgeProps = {
  status: AdminSessionStatus
}

export function AdminSessionStatusBadge({
  status,
}: AdminSessionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
        adminSessionStatusClass(status),
      )}
    >
      {adminSessionStatusLabel(status)}
    </span>
  )
}

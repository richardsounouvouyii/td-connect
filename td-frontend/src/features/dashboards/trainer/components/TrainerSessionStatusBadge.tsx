import {
  trainerSessionStatusClass,
  trainerSessionStatusLabel,
} from '@/features/dashboards/trainer/lib/format'
import type { TrainerSessionStatus } from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type TrainerSessionStatusBadgeProps = {
  status: TrainerSessionStatus
}

export function TrainerSessionStatusBadge({
  status,
}: TrainerSessionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
        trainerSessionStatusClass(status),
      )}
    >
      {trainerSessionStatusLabel(status)}
    </span>
  )
}

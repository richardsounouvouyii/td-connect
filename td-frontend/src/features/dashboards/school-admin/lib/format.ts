import type { AdminSessionStatus } from '@/features/dashboards/school-admin/types'

export {
  formatSessionDate,
  formatShortDate,
} from '@/features/dashboards/student/lib/format'

export {
  formatTrainerSessionPrice as formatAdminSessionPrice,
  trainerPricingLabel as adminPricingLabel,
} from '@/features/dashboards/trainer/lib/format'

/** Libellés côté admin (PENDING = en attente du formateur). */
export function adminSessionStatusLabel(status: AdminSessionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'En attente formateur'
    case 'PUBLISHED':
      return 'Validée'
    case 'POSTPONED':
      return 'Reportée'
    case 'REJECTED':
      return 'Refusée'
    case 'CANCELLED':
      return 'Annulée'
    case 'COMPLETED':
      return 'Terminée'
  }
}

export function adminSessionStatusClass(status: AdminSessionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'badge-warning'
    case 'PUBLISHED':
      return 'badge-success'
    case 'POSTPONED':
      return 'badge-warning'
    case 'REJECTED':
      return 'badge-error'
    case 'CANCELLED':
      return 'badge-error'
    case 'COMPLETED':
      return 'badge-ghost'
  }
}

/** Initiales à partir du nom complet (ex. Jean Formateur → JF). */
export function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  const first = parts[0]![0] ?? ''
  const last = parts[parts.length - 1]![0] ?? ''
  return `${first}${last}`.toUpperCase()
}

/** Rappel compact (ex. Jean Formateur → Jean F.). */
export function shortTrainerLabel(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!
  const first = parts[0]!
  const lastInitial = parts[parts.length - 1]![0]?.toUpperCase() ?? ''
  return lastInitial ? `${first} ${lastInitial}.` : first
}

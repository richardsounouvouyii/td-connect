import type {
  TrainerSession,
  TrainerSessionPricing,
  TrainerSessionStatus,
} from '@/features/dashboards/trainer/types'

export {
  formatSessionDate,
  formatShortDate,
} from '@/features/dashboards/student/lib/format'

export function trainerPricingLabel(pricing: TrainerSessionPricing): string {
  return pricing === 'PAID' ? 'Payant' : 'Gratuit'
}

export function formatTrainerSessionPrice(
  session: Pick<TrainerSession, 'pricing' | 'priceCfa'>,
): string | null {
  if (session.pricing !== 'PAID' || session.priceCfa == null) return null
  return `${session.priceCfa.toLocaleString('fr-FR')} F`
}

/** Libellés côté formateur : PUBLISHED = séance déjà validée par lui. */
export function trainerSessionStatusLabel(status: TrainerSessionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'À valider'
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

export function trainerSessionStatusClass(
  status: TrainerSessionStatus,
): string {
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

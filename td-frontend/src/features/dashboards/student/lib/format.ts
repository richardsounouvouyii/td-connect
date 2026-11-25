import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type {
  SessionPricing,
  SessionStatus,
  StudentSession,
} from '@/features/dashboards/student/types'

export function formatSessionDate(dateIso: string): string {
  return format(parseISO(dateIso), 'EEEE d MMMM yyyy', { locale: fr })
}

export function formatShortDate(dateIso: string): string {
  return format(parseISO(dateIso), 'd MMM yyyy', { locale: fr })
}

export function sessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'Publiée'
    case 'POSTPONED':
      return 'Reportée'
    case 'CANCELLED':
      return 'Annulée'
    case 'COMPLETED':
      return 'Terminée'
  }
}

export function sessionStatusClass(status: SessionStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'badge-success'
    case 'POSTPONED':
      return 'badge-warning'
    case 'CANCELLED':
      return 'badge-error'
    case 'COMPLETED':
      return 'badge-ghost'
  }
}

export function sessionPricingLabel(pricing: SessionPricing): string {
  return pricing === 'PAID' ? 'Payant' : 'Gratuit'
}

export function sessionPricingClass(pricing: SessionPricing): string {
  return pricing === 'PAID' ? 'badge-success' : 'badge-ghost'
}

export function formatSessionPrice(session: StudentSession): string | null {
  if (session.pricing !== 'PAID' || session.priceCfa == null) return null
  return `${session.priceCfa.toLocaleString('fr-FR')} F`
}

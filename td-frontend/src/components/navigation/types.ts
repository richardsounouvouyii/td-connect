import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Affiché dans la bottom nav mobile. */
  mobile?: boolean
  /** Compteur optionnel (ex. alertes non lues). */
  badge?: number
}

import { Bell, BookOpen, CalendarDays, Home, UserRound } from 'lucide-react'
import type { NavItem } from '@/components/navigation/types'

/** Menu réservé au rôle ÉLÈVE. */
export const studentNav: NavItem[] = [
  { to: '/eleve', label: 'Accueil', icon: Home, mobile: true },
  { to: '/eleve/planning', label: 'Planning', icon: CalendarDays, mobile: true },
  { to: '/eleve/epreuves', label: 'Épreuves', icon: BookOpen, mobile: true },
  {
    to: '/eleve/notifications',
    label: 'Alertes',
    icon: Bell,
    mobile: true,
  },
  { to: '/eleve/profil', label: 'Profil', icon: UserRound, mobile: true },
]

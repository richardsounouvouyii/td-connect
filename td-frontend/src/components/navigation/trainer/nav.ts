import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Home,
  UserRound,
} from 'lucide-react'
import type { NavItem } from '@/components/navigation/types'

/** Menu réservé au rôle FORMATEUR. */
export const trainerNav: NavItem[] = [
  { to: '/formateur', label: 'Accueil', icon: Home, mobile: true },
  {
    to: '/formateur/disponibilites',
    label: 'Programme',
    icon: CalendarDays,
    mobile: true,
  },
  {
    to: '/formateur/seances',
    label: 'Séances',
    icon: ClipboardList,
    mobile: true,
  },
  {
    to: '/formateur/documents',
    label: 'Documents',
    icon: BookOpen,
    mobile: true,
  },
  { to: '/formateur/notifications', label: 'Alertes', icon: Bell },
  { to: '/formateur/profil', label: 'Profil', icon: UserRound, mobile: true },
]

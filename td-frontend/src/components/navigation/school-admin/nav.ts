import {
  BookOpen,
  CalendarDays,
  Home,
  Settings,
  Users,
} from 'lucide-react'
import type { NavItem } from '@/components/navigation/types'

/** Menu réservé au rôle ADMIN ÉTABLISSEMENT. */
export const schoolAdminNav: NavItem[] = [
  { to: '/admin-etablissement', label: 'Accueil', icon: Home, mobile: true },
  {
    to: '/admin-etablissement/classes',
    label: 'Classes',
    icon: Users,
    mobile: true,
  },
  {
    to: '/admin-etablissement/planning',
    label: 'Planning',
    icon: CalendarDays,
    mobile: true,
  },
  {
    to: '/admin-etablissement/documents',
    label: 'Documents',
    icon: BookOpen,
    mobile: true,
  },
  {
    to: '/admin-etablissement/parametres',
    label: 'Paramètres',
    icon: Settings,
    mobile: true,
  },
]

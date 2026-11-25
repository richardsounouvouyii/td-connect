import { Building2, Home, Settings, Users } from 'lucide-react'
import type { NavItem } from '@/components/navigation/types'

/** Menu réservé au rôle SUPER ADMIN. */
export const superAdminNav: NavItem[] = [
  { to: '/super-admin', label: 'Accueil', icon: Home, mobile: true },
  {
    to: '/super-admin/etablissements',
    label: 'Établissements',
    icon: Building2,
    mobile: true,
  },
  {
    to: '/super-admin/comptes',
    label: 'Comptes',
    icon: Users,
    mobile: true,
  },
  {
    to: '/super-admin/parametres',
    label: 'Paramètres',
    icon: Settings,
    mobile: true,
  },
]

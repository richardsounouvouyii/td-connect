import { schoolAdminNav } from '@/components/navigation/school-admin/nav'
import { studentNav } from '@/components/navigation/student/nav'
import { superAdminNav } from '@/components/navigation/super-admin/nav'
import { trainerNav } from '@/components/navigation/trainer/nav'
import type { NavItem } from '@/components/navigation/types'
import type { Role } from '@/lib/auth/roles'

export type { NavItem }

/** Point d’entrée : choisit le menu selon le rôle connecté. */
export function navItemsForRole(role: Role): NavItem[] {
  switch (role) {
    case 'STUDENT':
      return studentNav
    case 'TRAINER':
      return trainerNav
    case 'SCHOOL_ADMIN':
      return schoolAdminNav
    case 'SUPER_ADMIN':
      return superAdminNav
  }
}

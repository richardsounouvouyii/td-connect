import {
  listAdminPlanningRows,
  type AdminPlanningRow,
} from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import { ADMIN_TRAINERS } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import type {
  AdminClass,
  AdminClassLevel,
  AdminTrainerOption,
} from '@/features/dashboards/school-admin/types'

const SCHOOL_YEAR = '2025-2026'

/** Classes démo — alignées sur le catalogue / propositions. */
export const ADMIN_CLASS_LIST: AdminClass[] = [
  {
    id: 'class-tde',
    label: 'Terminale D',
    level: 'Terminale',
    schoolYear: SCHOOL_YEAR,
    studentCount: 42,
    trainerIds: ['user-trainer-1', 'user-trainer-2', 'user-trainer-3'],
    groups: [
      {
        id: 'grp-tde-maths',
        label: 'TD Maths A',
        subject: 'Mathématiques',
        studentCount: 18,
      },
      {
        id: 'grp-tde-phys',
        label: 'TD Physique 1',
        subject: 'Physique-Chimie',
        studentCount: 16,
      },
      {
        id: 'grp-tde-svt',
        label: 'TD SVT B',
        subject: 'SVT',
        studentCount: 14,
      },
    ],
  },
  {
    id: 'class-tec',
    label: 'Terminale C',
    level: 'Terminale',
    schoolYear: SCHOOL_YEAR,
    studentCount: 38,
    trainerIds: ['user-trainer-1', 'user-trainer-2'],
    groups: [
      {
        id: 'grp-tec-maths',
        label: 'TD Maths A',
        subject: 'Mathématiques',
        studentCount: 20,
      },
      {
        id: 'grp-tec-phys',
        label: 'TD Physique 1',
        subject: 'Physique-Chimie',
        studentCount: 18,
      },
    ],
  },
  {
    id: 'class-3a',
    label: '3ème A',
    level: '3ème',
    schoolYear: SCHOOL_YEAR,
    studentCount: 35,
    trainerIds: ['user-trainer-1', 'user-trainer-3'],
    groups: [
      {
        id: 'grp-3a-maths',
        label: 'TD Maths A',
        subject: 'Mathématiques',
        studentCount: 18,
      },
      {
        id: 'grp-3a-svt',
        label: 'TD SVT B',
        subject: 'SVT',
        studentCount: 17,
      },
    ],
  },
]

export function listAdminClasses(): AdminClass[] {
  return [...ADMIN_CLASS_LIST]
}

export function getAdminClassById(id: string): AdminClass | undefined {
  return ADMIN_CLASS_LIST.find((item) => item.id === id)
}

export function getAdminClassByLabel(label: string): AdminClass | undefined {
  return ADMIN_CLASS_LIST.find((item) => item.label === label)
}

export function listAdminClassLevels(): AdminClassLevel[] {
  return ['Terminale', '3ème']
}

export function listTrainersForClass(classItem: AdminClass): AdminTrainerOption[] {
  return classItem.trainerIds
    .map((id) => ADMIN_TRAINERS.find((trainer) => trainer.id === id))
    .filter((trainer): trainer is AdminTrainerOption => Boolean(trainer))
}

/** Groupes TD pour une classe + matière. */
export function listGroupsForClassAndSubject(
  classLabel: string,
  subject: string,
): string[] {
  const classItem = getAdminClassByLabel(classLabel)
  if (!classItem) return []
  return classItem.groups
    .filter((group) => group.subject === subject)
    .map((group) => group.label)
}

/** Séances du planning liées à cette classe (offres publiques = 1 ligne). */
export function countSessionsForClass(classLabel: string): {
  total: number
  pending: number
  published: number
} {
  const rows = listAdminPlanningRows('ALL').filter((row) => {
    const session =
      row.kind === 'session' ? row.session : row.representative
    return session.classLabel === classLabel
  })
  return {
    total: rows.length,
    pending: rows.filter((row) => {
      const status = row.kind === 'session' ? row.session.status : row.status
      return status === 'PENDING'
    }).length,
    published: rows.filter((row) => {
      const status = row.kind === 'session' ? row.session.status : row.status
      return status === 'PUBLISHED'
    }).length,
  }
}

/** Prochaines lignes planning pour une classe (offres regroupées). */
export function listUpcomingRowsForClass(
  classLabel: string,
  limit = 3,
): AdminPlanningRow[] {
  return listAdminPlanningRows('ALL')
    .filter((row) => {
      const session =
        row.kind === 'session' ? row.session : row.representative
      if (session.classLabel !== classLabel) return false
      const status = row.kind === 'session' ? row.session.status : row.status
      return (
        status === 'PENDING' ||
        status === 'PUBLISHED' ||
        status === 'POSTPONED'
      )
    })
    .sort((a, b) => {
      const left = a.kind === 'session' ? a.session : a.representative
      const right = b.kind === 'session' ? b.session : b.representative
      const byDate = left.date.localeCompare(right.date)
      if (byDate !== 0) return byDate
      return left.startTime.localeCompare(right.startTime)
    })
    .slice(0, limit)
}

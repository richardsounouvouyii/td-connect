import type { StudentProfile } from '@/features/dashboards/student/types'

/** Profil scolaire démo — géré par l’établissement, contact modifiable côté élève. */
export const STUDENT_PROFILE_DEMO: StudentProfile = {
  classLabel: 'Terminale D',
  groups: ['TD Maths A', 'TD Physique 1', 'TD SVT B'],
  schoolYear: '2026–2027',
  levelLabel: 'Terminale',
  phone: '01 23 45 67 89',
}

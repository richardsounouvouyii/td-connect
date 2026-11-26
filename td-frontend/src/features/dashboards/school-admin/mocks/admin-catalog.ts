import type {
  AdminRoomOption,
  AdminTrainerOption,
} from '@/features/dashboards/school-admin/types'

export const ADMIN_TRAINERS: AdminTrainerOption[] = [
  {
    id: 'user-trainer-1',
    fullName: 'Jean Formateur',
    subjects: ['Mathématiques', 'Physique-Chimie'],
    classes: ['Terminale D', 'Terminale C', '3ème A'],
  },
  {
    id: 'user-trainer-2',
    fullName: 'Amina Koffi',
    subjects: ['Physique-Chimie'],
    classes: ['Terminale D', 'Terminale C'],
  },
  {
    id: 'user-trainer-3',
    fullName: 'Paul Mensah',
    subjects: ['SVT'],
    classes: ['Terminale D', '3ème A'],
  },
]

export const ADMIN_ROOMS: AdminRoomOption[] = [
  { id: 'room-b12', label: 'Salle B12' },
  { id: 'room-a05', label: 'Salle A05' },
  { id: 'room-a03', label: 'Salle A03' },
  { id: 'room-lab1', label: 'Labo 1' },
  { id: 'room-lab2', label: 'Labo 2' },
  { id: 'room-c03', label: 'Salle C03' },
  { id: 'room-amphi', label: 'Amphi 1' },
]

export const ADMIN_CLASSES = ['Terminale D', 'Terminale C', '3ème A'] as const
export const ADMIN_GROUPS = [
  'TD Maths A',
  'TD Physique 1',
  'TD SVT B',
] as const

export function getAdminTrainerById(
  id: string,
): AdminTrainerOption | undefined {
  return ADMIN_TRAINERS.find((trainer) => trainer.id === id)
}

/** Matières proposables (union des formateurs). */
export function listAdminSubjects(): string[] {
  const subjects = new Set<string>()
  for (const trainer of ADMIN_TRAINERS) {
    for (const subject of trainer.subjects) subjects.add(subject)
  }
  return [...subjects]
}

/** Formateurs concernés par une matière. */
export function listTrainersForSubject(subject: string): AdminTrainerOption[] {
  return ADMIN_TRAINERS.filter((trainer) =>
    trainer.subjects.includes(subject),
  )
}

/** Formateurs concernés par matière + classe. */
export function listTrainersForSubjectAndClass(
  subject: string,
  classLabel: string,
): AdminTrainerOption[] {
  return ADMIN_TRAINERS.filter(
    (trainer) =>
      trainer.subjects.includes(subject) &&
      trainer.classes.includes(classLabel),
  )
}

/** Classes d’un formateur. */
export function listClassesForTrainer(trainerId: string): string[] {
  return getAdminTrainerById(trainerId)?.classes ?? [...ADMIN_CLASSES]
}

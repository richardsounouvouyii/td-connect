import type { TrainerProfile } from '@/features/dashboards/trainer/types'

/**
 * Profil métier démo — plusieurs matières / classes possibles
 * (classes : 3ème et Terminale uniquement pour l’instant).
 */
export const TRAINER_PROFILE_DEMO: TrainerProfile = {
  subjects: ['Mathématiques', 'Physique-Chimie'],
  classes: ['3ème', 'Terminale'],
  groups: ['TD Maths A', 'TD Physique 1'],
  establishments: ['Lycée Démo Porto-Novo'],
  schoolYear: '2026–2027',
  phone: '01 40 50 60 70',
}

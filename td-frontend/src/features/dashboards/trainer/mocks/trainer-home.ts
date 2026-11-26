import {
  countPendingTrainerSessions,
  upcomingTrainerSessions,
} from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type { TrainerAlert } from '@/features/dashboards/trainer/types'

export const TRAINER_PROFILE_DEMO = {
  subjects: ['Mathématiques'],
  levels: ['Terminale'],
  groups: ['TD Maths A'],
}

export const TRAINER_UPCOMING_SESSIONS = upcomingTrainerSessions().slice(0, 4)

export function getTrainerPendingCount(): number {
  return countPendingTrainerSessions()
}

export const TRAINER_RECENT_ALERTS: TrainerAlert[] = [
  {
    id: 't-alert-1',
    message:
      'Proposition admin « Équations différentielles » — à accepter ou refuser (prix inclus).',
    createdAt: '2026-11-26',
    tone: 'warning',
  },
  {
    id: 't-alert-2',
    message: 'Séance Suites numériques reportée — salle A05 confirmée.',
    createdAt: '2026-11-25',
    tone: 'info',
  },
  {
    id: 't-alert-3',
    message: 'Proposition « Statistiques descriptives » rejetée (conflit bac blanc).',
    createdAt: '2026-11-24',
    tone: 'warning',
  },
]

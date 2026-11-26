import type {
  TrainerRecurringSlot,
  TrainerWeekday,
} from '@/features/dashboards/trainer/types'

const ESTABLISHMENT = 'Lycée Démo Porto-Novo'

export const WEEKDAY_LABELS: Record<TrainerWeekday, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
}

/** Jours proposés pour les TD (hors jours de cours classiques). */
export const AVAILABILITY_WEEKDAYS: TrainerWeekday[] = [3, 6, 7]

/**
 * Créneaux récurrents démo — durées libres (comme définies par le formateur).
 * Fenêtre autorisée : mer 16–19, sam/dim 08–19.
 */
export const TRAINER_RECURRING_SLOTS: TrainerRecurringSlot[] = [
  {
    id: 'slot-wed',
    weekday: 3,
    startTime: '16:00',
    endTime: '18:00',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
  {
    id: 'slot-sat-am',
    weekday: 6,
    startTime: '08:00',
    endTime: '10:30',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
  {
    id: 'slot-sat-mid',
    weekday: 6,
    startTime: '11:00',
    endTime: '13:00',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
  {
    id: 'slot-sun',
    weekday: 7,
    startTime: '10:30',
    endTime: '12:30',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
]

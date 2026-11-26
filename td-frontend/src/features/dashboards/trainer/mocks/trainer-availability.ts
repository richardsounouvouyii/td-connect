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

/** Créneaux récurrents démo — mercredi après-cours + week-end. */
export const TRAINER_RECURRING_SLOTS: TrainerRecurringSlot[] = [
  {
    id: 'slot-wed',
    weekday: 3,
    startTime: '16:00',
    endTime: '19:00',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
  {
    id: 'slot-sat',
    weekday: 6,
    startTime: '08:00',
    endTime: '19:00',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
  {
    id: 'slot-sun',
    weekday: 7,
    startTime: '08:00',
    endTime: '19:00',
    establishmentName: ESTABLISHMENT,
    active: true,
  },
]


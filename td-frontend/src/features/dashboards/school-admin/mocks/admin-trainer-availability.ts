import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getISODay,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { PLANNING_DEMO_TODAY } from '@/features/dashboards/student/lib/planning'
import {
  TRAINER_RECURRING_SLOTS,
  WEEKDAY_LABELS,
} from '@/features/dashboards/trainer/mocks/trainer-availability'
import type {
  TrainerRecurringSlot,
  TrainerWeekday,
} from '@/features/dashboards/trainer/types'

/**
 * Programmes démo par formateur (ce que l’admin voit pour proposer).
 * Jean = programme Maths (créneaux exacts) ; les autres = variantes.
 */
const BY_TRAINER: Record<string, TrainerRecurringSlot[]> = {
  'user-trainer-1': TRAINER_RECURRING_SLOTS,
  'user-trainer-2': [
    {
      id: 'amina-sat-am',
      weekday: 6,
      startTime: '08:00',
      endTime: '10:30',
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    },
    {
      id: 'amina-sat-mid',
      weekday: 6,
      startTime: '11:00',
      endTime: '13:00',
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    },
    {
      id: 'amina-sun',
      weekday: 7,
      startTime: '09:00',
      endTime: '11:00',
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    },
  ],
  'user-trainer-3': [
    {
      id: 'paul-wed',
      weekday: 3,
      startTime: '16:00',
      endTime: '18:00',
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    },
    {
      id: 'paul-sat',
      weekday: 6,
      startTime: '08:00',
      endTime: '11:00',
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    },
  ],
}

export function listTrainerProgrammeSlots(
  trainerId: string,
): TrainerRecurringSlot[] {
  return (BY_TRAINER[trainerId] ?? []).filter((slot) => slot.active)
}

/** Jours distincts du programme (ordre Mer → Dim). */
export function listTrainerProgrammeWeekdays(
  trainerId: string,
): TrainerWeekday[] {
  const seen = new Set<TrainerWeekday>()
  const ordered: TrainerWeekday[] = []
  for (const slot of listTrainerProgrammeSlots(trainerId)) {
    if (seen.has(slot.weekday)) continue
    seen.add(slot.weekday)
    ordered.push(slot.weekday)
  }
  return ordered.sort((a, b) => a - b)
}

/** Créneaux du programme pour un jour donné. */
export function listTrainerSlotsForWeekday(
  trainerId: string,
  weekday: TrainerWeekday,
): TrainerRecurringSlot[] {
  return listTrainerProgrammeSlots(trainerId)
    .filter((slot) => slot.weekday === weekday)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function slotHoursKey(slot: Pick<TrainerRecurringSlot, 'startTime' | 'endTime'>) {
  return `${slot.startTime}|${slot.endTime}`
}

/** Union des jours pour plusieurs formateurs (proposition publique). */
export function listUnionProgrammeWeekdays(
  trainerIds: string[],
): TrainerWeekday[] {
  const seen = new Set<TrainerWeekday>()
  for (const trainerId of trainerIds) {
    for (const day of listTrainerProgrammeWeekdays(trainerId)) {
      seen.add(day)
    }
  }
  return [...seen].sort((a, b) => a - b)
}

/**
 * Union des créneaux (heures exactes) pour un jour.
 * Une pastille = un couple début–fin présent chez au moins un formateur.
 */
export function listUnionSlotsForWeekday(
  trainerIds: string[],
  weekday: TrainerWeekday,
): TrainerRecurringSlot[] {
  const byHours = new Map<string, TrainerRecurringSlot>()
  for (const trainerId of trainerIds) {
    for (const slot of listTrainerSlotsForWeekday(trainerId, weekday)) {
      const key = slotHoursKey(slot)
      if (!byHours.has(key)) {
        byHours.set(key, {
          ...slot,
          id: `union-${weekday}-${key}`,
        })
      }
    }
  }
  return [...byHours.values()].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )
}

/** Formateurs (parmi la liste) qui ont exactement ce créneau. */
export function listTrainerIdsWithExactSlot(
  trainerIds: string[],
  weekday: TrainerWeekday,
  startTime: string,
  endTime: string,
): string[] {
  return trainerIds.filter((trainerId) =>
    listTrainerSlotsForWeekday(trainerId, weekday).some(
      (slot) =>
        slot.startTime === startTime && slot.endTime === endTime,
    ),
  )
}

export function formatWeekdayLabel(weekday: TrainerWeekday): string {
  return WEEKDAY_LABELS[weekday]
}

export function formatSlotHoursLabel(slot: TrainerRecurringSlot): string {
  return `${slot.startTime}–${slot.endTime}`
}

export function formatProgrammeSlotLabel(slot: TrainerRecurringSlot): string {
  return `${WEEKDAY_LABELS[slot.weekday]} ${slot.startTime}–${slot.endTime}`
}

/**
 * Dates du mois (Mer/Sam/Dim…) à partir d’aujourd’hui démo.
 * Ex. : les mercredis restants du mois courant (~0–4), sinon le mois suivant.
 */
export function listDatesForWeekdayInMonth(
  weekday: TrainerWeekday,
  from: Date = PLANNING_DEMO_TODAY,
): string[] {
  const collect = (monthAnchor: Date) => {
    const start = startOfMonth(monthAnchor)
    const end = endOfMonth(monthAnchor)
    const today = startOfDay(from)
    return eachDayOfInterval({ start, end })
      .filter((day) => getISODay(day) === weekday)
      .filter((day) => !isBefore(day, today))
      .map((day) => format(day, 'yyyy-MM-dd'))
  }

  const current = collect(from)
  if (current.length > 0) return current
  return collect(addMonths(from, 1))
}

/** @deprecated Prefer listDatesForWeekdayInMonth */
export function listUpcomingDatesForWeekday(
  weekday: TrainerWeekday,
  _count = 6,
  from: Date = PLANNING_DEMO_TODAY,
): string[] {
  return listDatesForWeekdayInMonth(weekday, from)
}

export function formatProposeDateLabel(isoDate: string): string {
  const label = format(parseISO(isoDate), 'EEEE d MMMM yyyy', { locale: fr })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Libellé court pour pastille (ex. 29 nov.). */
export function formatProposeDateChip(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM', { locale: fr })
}

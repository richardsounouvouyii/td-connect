import type { TrainerWeekday } from '@/features/dashboards/trainer/types'

/** Mercredi : TD seulement après les cours (16:00 → 19:00). */
export const WEDNESDAY_MIN_TIME = '16:00'
export const DAY_MAX_TIME = '19:00'
export const WEEKEND_MIN_TIME = '08:00'

export function minTimeForWeekday(weekday: TrainerWeekday): string {
  return weekday === 3 ? WEDNESDAY_MIN_TIME : WEEKEND_MIN_TIME
}

export function maxTimeForWeekday(_weekday: TrainerWeekday): string {
  return DAY_MAX_TIME
}

/** Horaires proposés dès qu’on change de jour. */
export function defaultRangeForWeekday(weekday: TrainerWeekday): {
  start: string
  end: string
} {
  if (weekday === 3) {
    return { start: WEDNESDAY_MIN_TIME, end: DAY_MAX_TIME }
  }
  return { start: '14:00', end: '16:00' }
}

export function isValidSlotRange(
  weekday: TrainerWeekday,
  startTime: string,
  endTime: string,
): { ok: true } | { ok: false; message: string } {
  if (startTime >= endTime) {
    return {
      ok: false,
      message: 'L’heure de fin doit être après le début.',
    }
  }

  const min = minTimeForWeekday(weekday)
  const max = maxTimeForWeekday(weekday)

  if (startTime < min) {
    return {
      ok: false,
      message:
        weekday === 3
          ? 'Le mercredi, les créneaux commencent au plus tôt à 16:00 (après les cours).'
          : `L’heure de début doit être au plus tôt ${min}.`,
    }
  }

  if (endTime > max) {
    return {
      ok: false,
      message: `L’heure de fin doit être au plus tard ${max}.`,
    }
  }

  return { ok: true }
}

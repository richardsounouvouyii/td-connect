import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type {
  SessionStatus,
  StudentSession,
} from '@/features/dashboards/student/types'

export type PlanningView = 'day' | 'week' | 'month'

/** Jour de référence démo (aligné sur les mocks). */
export const PLANNING_DEMO_TODAY = startOfDay(new Date('2026-11-25'))

export type SessionDayGroup = {
  date: string
  day: Date
  sessions: StudentSession[]
}

export type PlanningFilters = {
  subject: string | null
  status: SessionStatus | null
}

export function sessionsForDay(
  sessions: StudentSession[],
  day: Date,
): StudentSession[] {
  return sessions
    .filter((session) => isSameDay(parseISO(session.date), day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function sessionsForRange(
  sessions: StudentSession[],
  start: Date,
  end: Date,
): StudentSession[] {
  return sessions
    .filter((session) => {
      const date = parseISO(session.date)
      return date >= startOfDay(start) && date <= startOfDay(end)
    })
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date)
      return byDate !== 0 ? byDate : a.startTime.localeCompare(b.startTime)
    })
}

export function getViewInterval(view: PlanningView, anchor: Date) {
  if (view === 'day') {
    const day = startOfDay(anchor)
    return { start: day, end: day }
  }

  if (view === 'week') {
    const start = startOfWeek(anchor, { weekStartsOn: 1 })
    const end = endOfWeek(anchor, { weekStartsOn: 1 })
    return { start, end }
  }

  const start = startOfMonth(anchor)
  const end = endOfMonth(anchor)
  return { start, end }
}

export function shiftAnchor(view: PlanningView, anchor: Date, direction: -1 | 1) {
  if (view === 'day') return addDays(anchor, direction)
  if (view === 'week') return addWeeks(anchor, direction)
  return addMonths(anchor, direction)
}

export function formatPlanningTitle(view: PlanningView, anchor: Date): string {
  if (view === 'day') {
    return format(anchor, 'EEEE d MMMM yyyy', { locale: fr })
  }
  if (view === 'week') {
    const { start, end } = getViewInterval(view, anchor)
    return `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`
  }
  return format(anchor, 'MMMM yyyy', { locale: fr })
}

/** True si la période affichée contient déjà le jour démo. */
export function isViewingPlanningToday(
  view: PlanningView,
  anchor: Date,
  selectedDay: Date = anchor,
): boolean {
  if (view === 'day') return isSameDay(anchor, PLANNING_DEMO_TODAY)
  if (view === 'week') {
    const { start, end } = getViewInterval(view, anchor)
    return (
      PLANNING_DEMO_TODAY >= startOfDay(start) &&
      PLANNING_DEMO_TODAY <= startOfDay(end)
    )
  }
  return (
    isSameMonth(anchor, PLANNING_DEMO_TODAY) &&
    isSameDay(selectedDay, PLANNING_DEMO_TODAY)
  )
}

export function monthGridDays(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function dayHasSessions(
  sessions: StudentSession[],
  day: Date,
): boolean {
  return sessions.some((session) => isSameDay(parseISO(session.date), day))
}

export function isInCurrentMonth(day: Date, anchor: Date): boolean {
  return isSameMonth(day, anchor)
}

export function groupSessionsByDay(
  sessions: StudentSession[],
): SessionDayGroup[] {
  const map = new Map<string, StudentSession[]>()

  for (const session of sessions) {
    const list = map.get(session.date) ?? []
    list.push(session)
    map.set(session.date, list)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySessions]) => ({
      date,
      day: parseISO(date),
      sessions: [...daySessions].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    }))
}

export function applyPlanningFilters(
  sessions: StudentSession[],
  filters: PlanningFilters,
): StudentSession[] {
  return sessions.filter((session) => {
    if (filters.subject && session.subject !== filters.subject) return false
    if (filters.status && session.status !== filters.status) return false
    return true
  })
}

export function uniqueSubjects(sessions: StudentSession[]): string[] {
  return [...new Set(sessions.map((session) => session.subject))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
}

export function formatDayHeading(day: Date): string {
  if (isSameDay(day, PLANNING_DEMO_TODAY)) {
    return `Aujourd’hui · ${format(day, 'EEEE d MMMM', { locale: fr })}`
  }
  return format(day, 'EEEE d MMMM', { locale: fr })
}

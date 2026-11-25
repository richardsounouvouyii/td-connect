import { describe, expect, it } from 'vitest'
import {
  applyPlanningFilters,
  formatDayHeading,
  groupSessionsByDay,
  isViewingPlanningToday,
  PLANNING_DEMO_TODAY,
  sessionsForDay,
  shiftAnchor,
} from '@/features/dashboards/student/lib/planning'
import { STUDENT_SESSIONS } from '@/features/dashboards/student/mocks/student-sessions'

describe('planning helpers', () => {
  it('filtre les séances d’un jour', () => {
    const day = new Date('2026-11-26T12:00:00')
    const sessions = sessionsForDay(STUDENT_SESSIONS, day)
    expect(sessions).toHaveLength(1)
    expect(sessions[0]?.id).toBe('sess-1')
  })

  it('décale la semaine', () => {
    const anchor = new Date('2026-11-25')
    const next = shiftAnchor('week', anchor, 1)
    expect(next.getDate()).toBe(2)
    expect(next.getMonth()).toBe(11)
  })

  it('groupe les séances par jour', () => {
    const week = STUDENT_SESSIONS.filter(
      (s) => s.date >= '2026-11-24' && s.date <= '2026-11-28',
    )
    const groups = groupSessionsByDay(week)
    expect(groups.length).toBeGreaterThan(1)
    expect(groups[0]?.date).toBe('2026-11-24')
    expect(groups[0]?.sessions.length).toBe(2)
  })

  it('applique les filtres matière et statut', () => {
    const filtered = applyPlanningFilters(STUDENT_SESSIONS, {
      subject: 'Mathématiques',
      status: 'POSTPONED',
    })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((s) => s.subject === 'Mathématiques')).toBe(true)
    expect(filtered.every((s) => s.status === 'POSTPONED')).toBe(true)
  })

  it('marque le jour démo comme Aujourd’hui', () => {
    expect(formatDayHeading(PLANNING_DEMO_TODAY)).toMatch(/^Aujourd’hui/)
  })

  it('détecte si la période contient déjà aujourd’hui', () => {
    expect(isViewingPlanningToday('week', PLANNING_DEMO_TODAY)).toBe(true)
    expect(isViewingPlanningToday('day', PLANNING_DEMO_TODAY)).toBe(true)
    expect(
      isViewingPlanningToday('day', new Date('2026-11-27')),
    ).toBe(false)
  })
})

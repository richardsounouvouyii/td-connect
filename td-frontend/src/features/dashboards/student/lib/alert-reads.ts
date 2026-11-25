import { STUDENT_NOTIFICATIONS } from '@/features/dashboards/student/mocks/student-notifications'
import type { StudentNotification } from '@/features/dashboards/student/types'

const STORAGE_KEY = 'tdc.student.readAlerts'
export const STUDENT_ALERTS_CHANGED_EVENT = 'tdc.student.alerts-changed'

function readMarkedIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writeMarkedIds(ids: Set<string>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  window.dispatchEvent(new Event(STUDENT_ALERTS_CHANGED_EVENT))
}

export function isAlertRead(notification: StudentNotification): boolean {
  if (readMarkedIds().has(notification.id)) return true
  return notification.read
}

/** Liste démo avec état lu (mock + sessionStorage). */
export function listStudentAlerts(): StudentNotification[] {
  return [...STUDENT_NOTIFICATIONS]
    .map((notification) => ({
      ...notification,
      read: isAlertRead(notification),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getUnreadAlertCount(): number {
  return listStudentAlerts().filter((notification) => !notification.read).length
}

export function markAlertRead(id: string) {
  const ids = readMarkedIds()
  if (ids.has(id)) return
  ids.add(id)
  writeMarkedIds(ids)
}

export function markAllAlertsRead() {
  const ids = readMarkedIds()
  let changed = false
  for (const notification of STUDENT_NOTIFICATIONS) {
    if (!ids.has(notification.id) && !notification.read) {
      ids.add(notification.id)
      changed = true
    }
  }
  if (changed) writeMarkedIds(ids)
}

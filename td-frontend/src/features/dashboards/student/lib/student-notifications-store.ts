import type { StudentNotification } from '@/features/dashboards/student/types'

const EXTRA_KEY = 'tdc.student.extraNotifications'
const ALERTS_CHANGED_EVENT = 'tdc.student.alerts-changed'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function getStudentExtraNotifications(): StudentNotification[] {
  return readJson<StudentNotification[]>(EXTRA_KEY, [])
}

export function pushStudentNotification(
  input: Omit<StudentNotification, 'id' | 'read' | 'createdAt'> & {
    id?: string
    createdAt?: string
  },
): StudentNotification {
  const notification: StudentNotification = {
    id:
      input.id ??
      `s-notif-extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    kind: input.kind,
    createdAt: input.createdAt ?? '2026-11-26',
    read: false,
    linkedSessionId: input.linkedSessionId,
    linkedToExams: input.linkedToExams,
  }
  const extras = getStudentExtraNotifications()
  extras.unshift(notification)
  writeJson(EXTRA_KEY, extras)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ALERTS_CHANGED_EVENT))
  }
  return notification
}

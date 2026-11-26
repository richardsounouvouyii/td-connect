import { getTrainerExtraNotifications } from '@/features/dashboards/trainer/lib/trainer-notifications-store'
import { TRAINER_NOTIFICATIONS } from '@/features/dashboards/trainer/mocks/trainer-notifications'
import { DEMO_TRAINER_ID } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type { TrainerNotification } from '@/features/dashboards/trainer/types'

const STORAGE_KEY = 'tdc.trainer.readAlerts'
export const TRAINER_ALERTS_CHANGED_EVENT = 'tdc.trainer.alerts-changed'

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
  window.dispatchEvent(new Event(TRAINER_ALERTS_CHANGED_EVENT))
}

export function isTrainerAlertRead(
  notification: TrainerNotification,
): boolean {
  if (readMarkedIds().has(notification.id)) return true
  return notification.read
}

export function listTrainerAlerts(
  trainerId: string = DEMO_TRAINER_ID,
): TrainerNotification[] {
  const extras = getTrainerExtraNotifications()
    .filter((notification) => notification.trainerId === trainerId)
    .map(({ trainerId: _trainerId, ...notification }) => notification)

  return [...extras, ...TRAINER_NOTIFICATIONS]
    .map((notification) => ({
      ...notification,
      read: isTrainerAlertRead(notification),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getUnreadTrainerAlertCount(): number {
  return listTrainerAlerts().filter((notification) => !notification.read)
    .length
}

export function markTrainerAlertRead(id: string) {
  const ids = readMarkedIds()
  if (ids.has(id)) return
  ids.add(id)
  writeMarkedIds(ids)
}

export function markAllTrainerAlertsRead() {
  const ids = readMarkedIds()
  let changed = false
  for (const notification of listTrainerAlerts()) {
    if (!ids.has(notification.id) && !notification.read) {
      ids.add(notification.id)
      changed = true
    }
  }
  if (changed) writeMarkedIds(ids)
}

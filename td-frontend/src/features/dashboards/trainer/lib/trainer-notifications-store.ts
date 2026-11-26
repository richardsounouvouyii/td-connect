import type { TrainerNotification } from '@/features/dashboards/trainer/types'

const EXTRA_KEY = 'tdc.trainer.extraNotifications'

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

export type TrainerNotificationExtra = TrainerNotification & {
  trainerId: string
}

export function getTrainerExtraNotifications(): TrainerNotificationExtra[] {
  return readJson<TrainerNotificationExtra[]>(EXTRA_KEY, [])
}

export function pushTrainerNotification(
  input: Omit<TrainerNotificationExtra, 'id' | 'read' | 'createdAt'> & {
    id?: string
    createdAt?: string
  },
): TrainerNotificationExtra {
  const notification: TrainerNotificationExtra = {
    id: input.id ?? `t-notif-extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    kind: input.kind,
    createdAt: input.createdAt ?? '2026-11-26',
    read: false,
    linkedSessionId: input.linkedSessionId,
    linkedToDocuments: input.linkedToDocuments,
    trainerId: input.trainerId,
  }
  const extras = getTrainerExtraNotifications()
  extras.unshift(notification)
  writeJson(EXTRA_KEY, extras)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tdc.trainer.alerts-changed'))
  }
  return notification
}

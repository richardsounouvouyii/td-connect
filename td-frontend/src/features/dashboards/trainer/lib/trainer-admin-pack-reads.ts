import { sessionHasAdminPack } from '@/features/dashboards/trainer/mocks/trainer-admin-packs'
import { listTrainerSessions } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type { TrainerSession } from '@/features/dashboards/trainer/types'

const STORAGE_KEY = 'tdc.trainer.seenAdminPacks'
export const TRAINER_ADMIN_PACKS_CHANGED_EVENT = 'tdc.trainer.admin-packs-changed'

/** Packs déjà « connus » en démo (pas de badge au premier chargement). */
const SEED_SEEN_SESSION_IDS = ['sess-0', 'sess-8', 'sess-1'] as const

const ELIGIBLE_STATUSES: TrainerSession['status'][] = [
  'PUBLISHED',
  'POSTPONED',
  'COMPLETED',
]

function readSeenIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set(SEED_SEEN_SESSION_IDS)
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set(SEED_SEEN_SESSION_IDS)
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set(SEED_SEEN_SESSION_IDS)
  }
}

function writeSeenIds(ids: Set<string>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  window.dispatchEvent(new Event(TRAINER_ADMIN_PACKS_CHANGED_EVENT))
}

export function isAdminPackSeen(sessionId: string): boolean {
  return readSeenIds().has(sessionId)
}

export function listEligibleAdminPackSessionIds(): string[] {
  return listTrainerSessions()
    .filter(
      (session) =>
        ELIGIBLE_STATUSES.includes(session.status) &&
        sessionHasAdminPack(session.id),
    )
    .map((session) => session.id)
}

/** Séances validées avec pack admin pas encore consulté. */
export function getUnreadAdminPackCount(): number {
  const seen = readSeenIds()
  return listEligibleAdminPackSessionIds().filter((id) => !seen.has(id)).length
}

export function markAdminPackSeen(sessionId: string) {
  if (!sessionHasAdminPack(sessionId)) return
  const ids = readSeenIds()
  if (ids.has(sessionId)) return
  ids.add(sessionId)
  writeSeenIds(ids)
}

/** Marque tous les packs visibles dans Documents comme consultés. */
export function markAllAdminPacksSeen() {
  const ids = readSeenIds()
  let changed = false
  for (const sessionId of listEligibleAdminPackSessionIds()) {
    if (!ids.has(sessionId)) {
      ids.add(sessionId)
      changed = true
    }
  }
  if (changed) writeSeenIds(ids)
}

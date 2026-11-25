import type { StudentSession } from '@/features/dashboards/student/types'

const STORAGE_KEY = 'tdc.student.joinedSessions'

function readJoinedIds(): Set<string> {
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

function writeJoinedIds(ids: Set<string>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function canJoinSession(session: StudentSession): boolean {
  return session.status === 'PUBLISHED' || session.status === 'POSTPONED'
}

export function isSessionJoined(
  sessionId: string,
  initialJoined?: boolean,
): boolean {
  if (readJoinedIds().has(sessionId)) return true
  return initialJoined === true
}

export function joinSession(sessionId: string) {
  const ids = readJoinedIds()
  ids.add(sessionId)
  writeJoinedIds(ids)
}

export function leaveSession(sessionId: string) {
  const ids = readJoinedIds()
  ids.delete(sessionId)
  writeJoinedIds(ids)
}

/** Places restantes visibles pour l’élève (ajuste si inscription locale). */
export function getSeatsRemaining(
  session: StudentSession,
  joined: boolean,
): number {
  let taken = session.seatsTaken
  if (joined && !session.joined) taken += 1
  if (!joined && session.joined) taken -= 1
  return Math.max(0, session.seatsTotal - taken)
}

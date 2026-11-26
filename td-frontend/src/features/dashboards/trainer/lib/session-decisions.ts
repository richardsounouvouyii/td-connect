import { differenceInCalendarDays, parseISO } from 'date-fns'
import {
  claimPublicOfferSession,
  findOfferGroupBySessionId,
  getAdminExtraSessions,
  mergeAdminSessionOverrides,
  patchAdminSessionStatus,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import { getAdminTrainerById } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import { PLANNING_DEMO_TODAY } from '@/features/dashboards/student/lib/planning'
import type {
  TrainerSession,
  TrainerSessionStatus,
} from '@/features/dashboards/trainer/types'

const STORAGE_KEY = 'tdc.trainer.sessionDecisions'

/** Refus d’une séance déjà validée : au moins N jours calendaires avant la date. */
export const REFUSE_MIN_DAYS_BEFORE = 2

type SessionDecision = {
  status: Extract<TrainerSessionStatus, 'PUBLISHED' | 'REJECTED' | 'CANCELLED'>
  statusNote?: string
}

type DecisionsMap = Record<string, SessionDecision>

function readDecisions(): DecisionsMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as DecisionsMap
  } catch {
    return {}
  }
}

function writeDecisions(map: DecisionsMap) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

/** Applique les décisions locales (accepter / refuser) sur une séance mock. */
export function resolveTrainerSession(
  session: TrainerSession,
): TrainerSession {
  const decision = readDecisions()[session.id]
  if (!decision) return session
  return {
    ...session,
    status: decision.status,
    statusNote: decision.statusNote ?? session.statusNote,
  }
}

export function acceptTrainerSession(sessionId: string): {
  ok: boolean
  reason?: string
} {
  const extras = getAdminExtraSessions().map(mergeAdminSessionOverrides)
  const extra = extras.find((session) => session.id === sessionId)
  const winnerName =
    extra?.trainerName ??
    (extra ? getAdminTrainerById(extra.trainerId)?.fullName : undefined) ??
    'un formateur'

  if (extra?.offerGroupId || findOfferGroupBySessionId(sessionId)) {
    const claim = claimPublicOfferSession(sessionId, winnerName)
    if (!claim.ok) {
      const map = readDecisions()
      map[sessionId] = {
        status: 'CANCELLED',
        statusNote: claim.reason,
      }
      writeDecisions(map)
      return { ok: false, reason: claim.reason }
    }

    const group = findOfferGroupBySessionId(sessionId)
    const map = readDecisions()
    map[sessionId] = { status: 'PUBLISHED' }
    if (group) {
      const takenNote = `Cette proposition publique a déjà été validée par ${winnerName}. Vous ne pouvez plus la valider.`
      for (const siblingId of group.sessionIds) {
        if (siblingId === sessionId) continue
        map[siblingId] = {
          status: 'CANCELLED',
          statusNote: takenNote,
        }
      }
    }
    writeDecisions(map)
    return { ok: true }
  }

  const map = readDecisions()
  map[sessionId] = { status: 'PUBLISHED' }
  writeDecisions(map)
  patchAdminSessionStatus(sessionId, 'PUBLISHED')
  return { ok: true }
}

export function refuseTrainerSession(sessionId: string, reason: string) {
  const note = reason.trim() || 'Refusée par le formateur.'
  const map = readDecisions()
  map[sessionId] = {
    status: 'REJECTED',
    statusNote: note,
  }
  writeDecisions(map)
  patchAdminSessionStatus(sessionId, 'REJECTED', note)
}

/** Séance à valider : bouton Valider sur la liste. */
export function canValidateFromList(session: TrainerSession): boolean {
  return session.status === 'PENDING'
}

/**
 * Séance déjà validée : refus possible jusqu’à REFUSE_MIN_DAYS_BEFORE jours avant.
 * (Règle démo — ajustable plus tard avec l’admin.)
 */
export function canRefuseValidatedSession(
  session: TrainerSession,
  today: Date = PLANNING_DEMO_TODAY,
): boolean {
  if (session.status !== 'PUBLISHED' && session.status !== 'POSTPONED') {
    return false
  }
  const daysBefore = differenceInCalendarDays(parseISO(session.date), today)
  return daysBefore >= REFUSE_MIN_DAYS_BEFORE
}

/** Message clair si l’offre publique a été prise ailleurs. */
export function isPublicOfferTaken(session: TrainerSession): boolean {
  return (
    session.status === 'CANCELLED' &&
    Boolean(session.isPublicOffer || session.offerGroupId) &&
    Boolean(session.statusNote?.toLowerCase().includes('déjà été validée'))
  )
}

import { differenceInCalendarDays, parseISO } from 'date-fns'
import { PLANNING_DEMO_TODAY } from '@/features/dashboards/student/lib/planning'
import type {
  TrainerSession,
  TrainerSessionStatus,
} from '@/features/dashboards/trainer/types'

const STORAGE_KEY = 'tdc.trainer.sessionDecisions'

/** Refus d’une séance déjà validée : au moins N jours calendaires avant la date. */
export const REFUSE_MIN_DAYS_BEFORE = 2

type SessionDecision = {
  status: Extract<TrainerSessionStatus, 'PUBLISHED' | 'REJECTED'>
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

export function acceptTrainerSession(sessionId: string) {
  const map = readDecisions()
  map[sessionId] = { status: 'PUBLISHED' }
  writeDecisions(map)
}

export function refuseTrainerSession(sessionId: string, reason: string) {
  const map = readDecisions()
  map[sessionId] = {
    status: 'REJECTED',
    statusNote: reason.trim() || 'Refusée par le formateur.',
  }
  writeDecisions(map)
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

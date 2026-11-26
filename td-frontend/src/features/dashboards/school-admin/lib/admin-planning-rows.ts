import { listAdminSessions } from '@/features/dashboards/school-admin/mocks/admin-sessions'
import type {
  AdminSession,
  AdminSessionStatus,
} from '@/features/dashboards/school-admin/types'

export type AdminPlanningRow =
  | {
      kind: 'session'
      id: string
      session: AdminSession
    }
  | {
      kind: 'publicOffer'
      id: string
      offerGroupId: string
      sessions: AdminSession[]
      representative: AdminSession
      status: AdminSessionStatus
      trainerNames: string[]
      pendingCount: number
      winnerName?: string
      statusNote?: string
    }

function pickOfferStatus(sessions: AdminSession[]): {
  status: AdminSessionStatus
  representative: AdminSession
  winnerName?: string
  statusNote?: string
} {
  const published = sessions.find((session) => session.status === 'PUBLISHED')
  if (published) {
    return {
      status: 'PUBLISHED',
      representative: published,
      winnerName: published.trainerName,
    }
  }

  const pending = sessions.find((session) => session.status === 'PENDING')
  if (pending) {
    return { status: 'PENDING', representative: pending }
  }

  const postponed = sessions.find((session) => session.status === 'POSTPONED')
  if (postponed) {
    return { status: 'POSTPONED', representative: postponed }
  }

  const cancelled = sessions.find((session) => session.status === 'CANCELLED')
  if (cancelled) {
    return {
      status: 'CANCELLED',
      representative: cancelled,
      statusNote: cancelled.statusNote,
    }
  }

  const first = sessions[0]!
  return { status: first.status, representative: first, statusNote: first.statusNote }
}

export type AdminPlanningFilter = 'ALL' | 'PUBLIC' | AdminSessionStatus

/**
 * Planning admin : 1 ligne par séance directe,
 * 1 ligne regroupée par offre publique (offerGroupId).
 * Filtre `PUBLIC` = uniquement les offres publiques.
 */
export function listAdminPlanningRows(
  statusFilter: AdminPlanningFilter = 'ALL',
): AdminPlanningRow[] {
  const sessions = listAdminSessions()
  const rows: AdminPlanningRow[] = []
  const seenGroups = new Set<string>()
  const onlyPublic = statusFilter === 'PUBLIC'

  for (const session of sessions) {
    if (!session.offerGroupId || !session.isPublicOffer) {
      if (onlyPublic) continue
      if (statusFilter !== 'ALL' && session.status !== statusFilter) continue
      rows.push({ kind: 'session', id: session.id, session })
      continue
    }

    if (seenGroups.has(session.offerGroupId)) continue
    seenGroups.add(session.offerGroupId)

    const groupSessions = sessions.filter(
      (item) => item.offerGroupId === session.offerGroupId,
    )
    const picked = pickOfferStatus(groupSessions)
    if (
      !onlyPublic &&
      statusFilter !== 'ALL' &&
      picked.status !== statusFilter
    ) {
      continue
    }

    rows.push({
      kind: 'publicOffer',
      id: session.offerGroupId,
      offerGroupId: session.offerGroupId,
      sessions: groupSessions,
      representative: picked.representative,
      status: picked.status,
      trainerNames: [...new Set(groupSessions.map((item) => item.trainerName))].sort(
        (a, b) => a.localeCompare(b, 'fr'),
      ),
      pendingCount: groupSessions.filter((item) => item.status === 'PENDING')
        .length,
      winnerName: picked.winnerName,
      statusNote: picked.statusNote,
    })
  }

  return rows.sort((a, b) => {
    const left = a.kind === 'session' ? a.session : a.representative
    const right = b.kind === 'session' ? b.session : b.representative
    const byDate = right.date.localeCompare(left.date)
    if (byDate !== 0) return byDate
    return right.startTime.localeCompare(left.startTime)
  })
}

/** Compte les lignes (1 offre publique = 1 attente). */
export function countAdminPendingPlanningRows(): number {
  return listAdminPlanningRows('PENDING').length
}

export function countAdminMissingPackPlanningRows(): number {
  return listAdminPlanningRows('ALL').filter((row) => {
    const session = row.kind === 'session' ? row.session : row.representative
    if (
      session.status !== 'PENDING' &&
      session.status !== 'PUBLISHED' &&
      session.status !== 'POSTPONED'
    ) {
      return false
    }
    return !session.hasAdminExam || !session.hasAdminCorrection
  }).length
}

/** Prochaines lignes planning (offres déjà regroupées). */
export function listUpcomingAdminPlanningRows(limit = 5): AdminPlanningRow[] {
  return listAdminPlanningRows('ALL')
    .filter((row) => {
      const status = row.kind === 'session' ? row.session.status : row.status
      return (
        status === 'PUBLISHED' ||
        status === 'POSTPONED' ||
        status === 'PENDING'
      )
    })
    .sort((a, b) => {
      const left = a.kind === 'session' ? a.session : a.representative
      const right = b.kind === 'session' ? b.session : b.representative
      const byDate = left.date.localeCompare(right.date)
      if (byDate !== 0) return byDate
      return left.startTime.localeCompare(right.startTime)
    })
    .slice(0, limit)
}

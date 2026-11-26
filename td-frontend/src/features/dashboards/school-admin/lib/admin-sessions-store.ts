import { getAdminTrainerById } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import { DEMO_PUBLIC_OFFER_SESSIONS } from '@/features/dashboards/school-admin/mocks/admin-demo-public-offers'
import type {
  AdminProposePublicSessionInput,
  AdminProposeSessionInput,
  AdminSession,
} from '@/features/dashboards/school-admin/types'
import { pushTrainerNotification } from '@/features/dashboards/trainer/lib/trainer-notifications-store'
import type { TrainerAdminPack } from '@/features/dashboards/trainer/types'

const EXTRA_KEY = 'tdc.admin.extraSessions'
const OVERRIDES_KEY = 'tdc.admin.sessionOverrides'
const PACKS_KEY = 'tdc.admin.sessionPacks'
const OFFER_GROUPS_KEY = 'tdc.admin.publicOfferGroups'

export const PUBLIC_OFFER_TAKEN_MESSAGE =
  'Cette proposition publique a déjà été validée par un autre formateur. Vous ne pouvez plus la valider.'

type SessionOverride = Partial<
  Pick<
    AdminSession,
    | 'status'
    | 'statusNote'
    | 'room'
    | 'hasAdminExam'
    | 'hasAdminCorrection'
    | 'proposalNote'
  >
>

type PublicOfferGroup = {
  id: string
  sessionIds: string[]
  winnerSessionId?: string
  winnerTrainerName?: string
}

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

export function getAdminExtraSessions(): AdminSession[] {
  return readJson<AdminSession[]>(EXTRA_KEY, [])
}

function saveExtraSession(session: AdminSession) {
  const extras = getAdminExtraSessions()
  extras.unshift(session)
  writeJson(EXTRA_KEY, extras)
}

function readOfferGroups(): Record<string, PublicOfferGroup> {
  return readJson<Record<string, PublicOfferGroup>>(OFFER_GROUPS_KEY, {})
}

function writeOfferGroups(map: Record<string, PublicOfferGroup>) {
  writeJson(OFFER_GROUPS_KEY, map)
}

export function getPublicOfferGroup(
  offerGroupId: string,
): PublicOfferGroup | undefined {
  return readOfferGroups()[offerGroupId]
}

export function findOfferGroupBySessionId(
  sessionId: string,
): PublicOfferGroup | undefined {
  const stored = Object.values(readOfferGroups()).find((group) =>
    group.sessionIds.includes(sessionId),
  )
  if (stored) return stored

  const known = [...DEMO_PUBLIC_OFFER_SESSIONS, ...getAdminExtraSessions()].map(
    mergeAdminSessionOverrides,
  )
  const session = known.find((item) => item.id === sessionId)
  if (!session?.offerGroupId) return undefined

  const siblings = known.filter(
    (item) => item.offerGroupId === session.offerGroupId,
  )
  const winner = siblings.find((item) => item.status === 'PUBLISHED')
  return {
    id: session.offerGroupId,
    sessionIds: siblings.map((item) => item.id),
    winnerSessionId: winner?.id,
    winnerTrainerName: winner?.trainerName,
  }
}

export function mergeAdminSessionOverrides(session: AdminSession): AdminSession {
  const overrides = readJson<Record<string, SessionOverride>>(OVERRIDES_KEY, {})
  const packs = readJson<Record<string, TrainerAdminPack>>(PACKS_KEY, {})
  const override = overrides[session.id]
  const pack = packs[session.id]

  return {
    ...session,
    ...override,
    hasAdminExam: Boolean(pack?.exam) || Boolean(override?.hasAdminExam) || session.hasAdminExam,
    hasAdminCorrection:
      Boolean(pack?.correction) ||
      Boolean(override?.hasAdminCorrection) ||
      session.hasAdminCorrection,
  }
}

export function getAdminSessionPack(
  sessionId: string,
): TrainerAdminPack | undefined {
  const packs = readJson<Record<string, TrainerAdminPack>>(PACKS_KEY, {})
  return packs[sessionId]
}

export function saveAdminSessionPack(
  sessionId: string,
  pack: TrainerAdminPack,
) {
  const packs = readJson<Record<string, TrainerAdminPack>>(PACKS_KEY, {})
  packs[sessionId] = pack
  writeJson(PACKS_KEY, packs)

  const overrides = readJson<Record<string, SessionOverride>>(OVERRIDES_KEY, {})
  overrides[sessionId] = {
    ...overrides[sessionId],
    hasAdminExam: Boolean(pack.exam),
    hasAdminCorrection: Boolean(pack.correction),
  }
  writeJson(OVERRIDES_KEY, overrides)
}

function buildAdminSession(
  input: AdminProposeSessionInput,
  id: string,
): AdminSession {
  const trainer = getAdminTrainerById(input.trainerId)
  return {
    id,
    subject: input.subject,
    chapter: input.chapter,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    room: input.room,
    groupLabel: input.groupLabel,
    classLabel: input.classLabel,
    status: 'PENDING',
    establishmentName: 'Lycée Démo Porto-Novo',
    trainerId: input.trainerId,
    trainerName: trainer?.fullName ?? 'Formateur',
    seatsTotal: 20,
    seatsTaken: 0,
    pricing: input.pricing,
    priceCfa: input.pricing === 'PAID' ? input.priceCfa : undefined,
    objectives: input.objectives,
    proposalNote: input.proposalNote,
    hasAdminExam: Boolean(input.adminPack?.exam),
    hasAdminCorrection: Boolean(input.adminPack?.correction),
    studentExamPublished: false,
    studentCorrectionPublished: false,
    offerGroupId: input.offerGroupId,
    isPublicOffer: input.isPublicOffer,
  }
}

function notifyTrainerOfProposal(session: AdminSession, isPublic: boolean) {
  pushTrainerNotification({
    trainerId: session.trainerId,
    title: isPublic ? 'Proposition publique' : 'Séance à valider',
    message: isPublic
      ? `Offre publique « ${session.chapter} » (${session.subject}) — premier qui valide obtient la séance.`
      : `Proposition « ${session.chapter} » — à valider ou refuser.`,
    kind: 'PROPOSAL_PENDING',
    linkedSessionId: session.id,
  })
}

export function proposeAdminSession(
  input: AdminProposeSessionInput,
): AdminSession {
  const session = buildAdminSession(input, `admin-new-${Date.now()}`)
  saveExtraSession(session)

  if (input.adminPack && (input.adminPack.exam || input.adminPack.correction)) {
    saveAdminSessionPack(session.id, input.adminPack)
  }

  notifyTrainerOfProposal(session, Boolean(input.isPublicOffer))
  return session
}

/**
 * Proposition publique : une séance PENDING par formateur dispos sur le créneau.
 * Le premier qui valide ferme les autres.
 */
export function proposePublicAdminSessions(
  input: AdminProposePublicSessionInput,
): AdminSession[] {
  if (input.trainerIds.length === 0) return []

  const offerGroupId = `offer-${Date.now()}`
  const notePrefix = 'Proposition publique — premier formateur qui valide obtient la séance.'
  const proposalNote = input.proposalNote?.trim()
    ? `${notePrefix}\n${input.proposalNote.trim()}`
    : notePrefix

  const sessions = input.trainerIds.map((trainerId, index) => {
    const session = buildAdminSession(
      {
        ...input,
        trainerId,
        proposalNote,
        offerGroupId,
        isPublicOffer: true,
      },
      `admin-public-${Date.now()}-${index}`,
    )
    saveExtraSession(session)
    if (input.adminPack && (input.adminPack.exam || input.adminPack.correction)) {
      saveAdminSessionPack(session.id, input.adminPack)
    }
    notifyTrainerOfProposal(session, true)
    return session
  })

  const groups = readOfferGroups()
  groups[offerGroupId] = {
    id: offerGroupId,
    sessionIds: sessions.map((session) => session.id),
  }
  writeOfferGroups(groups)

  return sessions
}

export function patchAdminSessionStatus(
  sessionId: string,
  status: AdminSession['status'],
  statusNote?: string,
) {
  const overrides = readJson<Record<string, SessionOverride>>(OVERRIDES_KEY, {})
  overrides[sessionId] = {
    ...overrides[sessionId],
    status,
    ...(statusNote !== undefined ? { statusNote } : {}),
  }
  writeJson(OVERRIDES_KEY, overrides)
}

/**
 * Premier validé gagne : publie la séance gagnante et annule les sœurs.
 * @returns false si l’offre était déjà prise.
 */
export function claimPublicOfferSession(
  sessionId: string,
  winnerTrainerName: string,
): { ok: true } | { ok: false; reason: string } {
  const group = findOfferGroupBySessionId(sessionId)
  if (!group) return { ok: true }

  if (group.winnerSessionId && group.winnerSessionId !== sessionId) {
    const name = group.winnerTrainerName ?? 'un autre formateur'
    return {
      ok: false,
      reason: `Cette proposition publique a déjà été validée par ${name}. Vous ne pouvez plus la valider.`,
    }
  }

  if (group.winnerSessionId === sessionId) return { ok: true }

  group.winnerSessionId = sessionId
  group.winnerTrainerName = winnerTrainerName
  const groups = readOfferGroups()
  groups[group.id] = group
  writeOfferGroups(groups)

  patchAdminSessionStatus(sessionId, 'PUBLISHED')

  const takenNote = `Cette proposition publique a déjà été validée par ${winnerTrainerName}. Vous ne pouvez plus la valider.`
  for (const siblingId of group.sessionIds) {
    if (siblingId === sessionId) continue
    patchAdminSessionStatus(siblingId, 'CANCELLED', takenNote)
  }

  return { ok: true }
}

export function postponeAdminSession(sessionId: string, note: string) {
  const overrides = readJson<Record<string, SessionOverride>>(OVERRIDES_KEY, {})
  overrides[sessionId] = {
    ...overrides[sessionId],
    status: 'POSTPONED',
    statusNote: note || 'Report demandé par l’établissement.',
  }
  writeJson(OVERRIDES_KEY, overrides)
}

export function cancelAdminSession(sessionId: string, note: string) {
  const overrides = readJson<Record<string, SessionOverride>>(OVERRIDES_KEY, {})
  overrides[sessionId] = {
    ...overrides[sessionId],
    status: 'CANCELLED',
    statusNote: note || 'Annulée par l’établissement.',
  }
  writeJson(OVERRIDES_KEY, overrides)
}

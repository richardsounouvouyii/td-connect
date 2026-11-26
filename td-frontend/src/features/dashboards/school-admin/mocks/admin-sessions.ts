import { getTrainerAdminPack } from '@/features/dashboards/trainer/mocks/trainer-admin-packs'
import { listTrainerMockSessions } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type { AdminSession } from '@/features/dashboards/school-admin/types'
import { DEMO_PUBLIC_OFFER_SESSIONS } from '@/features/dashboards/school-admin/mocks/admin-demo-public-offers'
import {
  getAdminExtraSessions,
  getAdminSessionPack,
  mergeAdminSessionOverrides,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'

const ESTABLISHMENT = 'Lycée Démo Porto-Novo'

/** Séances hors périmètre Jean Formateur (autres formateurs de l’école). */
const OTHER_TRAINER_SESSIONS: AdminSession[] = [
  {
    id: 'admin-sess-phys-1',
    subject: 'Physique-Chimie',
    chapter: 'Mécanique — forces',
    date: '2026-11-25',
    startTime: '08:00',
    endTime: '10:00',
    room: 'Labo 1',
    groupLabel: 'TD Physique 1',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    trainerId: 'user-trainer-2',
    trainerName: 'Amina Koffi',
    seatsTotal: 20,
    seatsTaken: 11,
    pricing: 'PAID',
    priceCfa: 400,
    hasAdminExam: true,
    hasAdminCorrection: true,
    studentExamPublished: true,
    studentCorrectionPublished: true,
  },
  {
    id: 'admin-sess-svt-1',
    subject: 'SVT',
    chapter: 'Immunologie',
    date: '2026-11-27',
    startTime: '08:00',
    endTime: '10:00',
    room: 'Salle C03',
    groupLabel: 'TD SVT B',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    trainerId: 'user-trainer-3',
    trainerName: 'Paul Mensah',
    seatsTotal: 15,
    seatsTaken: 10,
    pricing: 'PAID',
    priceCfa: 300,
    hasAdminExam: true,
    hasAdminCorrection: false,
    studentExamPublished: true,
    studentCorrectionPublished: false,
  },
  {
    id: 'admin-sess-phys-pending',
    subject: 'Physique-Chimie',
    chapter: 'Électricité',
    date: '2026-11-28',
    startTime: '08:00',
    endTime: '10:00',
    room: 'Labo 2',
    groupLabel: 'TD Physique 1',
    classLabel: 'Terminale D',
    status: 'PENDING',
    establishmentName: ESTABLISHMENT,
    trainerId: 'user-trainer-2',
    trainerName: 'Amina Koffi',
    seatsTotal: 20,
    seatsTaken: 0,
    pricing: 'FREE',
    proposalNote: 'Créneau libre samedi matin — séance gratuite proposée.',
    hasAdminExam: true,
    hasAdminCorrection: true,
    studentExamPublished: false,
    studentCorrectionPublished: false,
  },
]

function fromTrainerSession(
  session: ReturnType<typeof listTrainerMockSessions>[number],
): AdminSession {
  const pack =
    getAdminSessionPack(session.id) ?? getTrainerAdminPack(session.id)
  return {
    id: session.id,
    subject: session.subject,
    chapter: session.chapter,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    room: session.room,
    groupLabel: session.groupLabel,
    classLabel: session.classLabel,
    status: session.status,
    establishmentName: session.establishmentName,
    trainerId: 'user-trainer-1',
    trainerName: 'Jean Formateur',
    seatsTotal: session.seatsTotal,
    seatsTaken: session.seatsTaken,
    pricing: session.pricing,
    priceCfa: session.priceCfa,
    objectives: session.objectives,
    statusNote: session.statusNote,
    proposalNote: session.proposalNote,
    hasAdminExam: Boolean(pack?.exam),
    hasAdminCorrection: Boolean(pack?.correction),
    studentExamPublished: Boolean(session.hasExam),
    studentCorrectionPublished: Boolean(session.hasCorrection),
    offerGroupId: session.offerGroupId,
    isPublicOffer: session.isPublicOffer,
  }
}

export function listAdminSessions(): AdminSession[] {
  const fromTrainer = listTrainerMockSessions().map(fromTrainerSession)
  const extras = [
    ...DEMO_PUBLIC_OFFER_SESSIONS,
    ...OTHER_TRAINER_SESSIONS,
    ...getAdminExtraSessions(),
  ]
  const merged = [...fromTrainer, ...extras].map(mergeAdminSessionOverrides)

  return merged.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    return b.startTime.localeCompare(a.startTime)
  })
}

export function getAdminSessionById(id: string): AdminSession | undefined {
  return listAdminSessions().find((session) => session.id === id)
}

export function listUpcomingAdminSessions(limit = 5): AdminSession[] {
  return listAdminSessions()
    .filter(
      (session) =>
        session.status === 'PUBLISHED' ||
        session.status === 'POSTPONED' ||
        session.status === 'PENDING',
    )
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date)
      if (byDate !== 0) return byDate
      return a.startTime.localeCompare(b.startTime)
    })
    .slice(0, limit)
}

/** Compte les lignes planning (1 offre publique = 1, pas N copies). */
export function getAdminPendingTrainerCount(): number {
  return listAdminSessions().filter((session) => session.status === 'PENDING')
    .length
}

export function getAdminMissingPackCount(): number {
  return listAdminSessions().filter(
    (session) =>
      (session.status === 'PENDING' ||
        session.status === 'PUBLISHED' ||
        session.status === 'POSTPONED') &&
      (!session.hasAdminExam || !session.hasAdminCorrection),
  ).length
}

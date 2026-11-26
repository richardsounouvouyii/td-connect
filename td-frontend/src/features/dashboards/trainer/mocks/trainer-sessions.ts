import {
  getAdminExtraSessions,
  mergeAdminSessionOverrides,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import { getDemoPublicOfferSessionsForTrainer } from '@/features/dashboards/school-admin/mocks/admin-demo-public-offers'
import type { AdminSession } from '@/features/dashboards/school-admin/types'
import { resolveTrainerSession } from '@/features/dashboards/trainer/lib/session-decisions'
import type { TrainerSession } from '@/features/dashboards/trainer/types'

const ESTABLISHMENT = 'Lycée Démo Porto-Novo'

/** Dashboard formateur démo = Jean Formateur. */
export const DEMO_TRAINER_ID = 'user-trainer-1'

function adminSessionToTrainer(session: AdminSession): TrainerSession {
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
    seatsTotal: session.seatsTotal,
    seatsTaken: session.seatsTaken,
    pricing: session.pricing,
    priceCfa: session.priceCfa,
    objectives: session.objectives,
    statusNote: session.statusNote,
    proposalNote: session.proposalNote,
    hasExam: session.studentExamPublished,
    hasCorrection: session.studentCorrectionPublished,
    offerGroupId: session.offerGroupId,
    isPublicOffer: session.isPublicOffer,
  }
}

/** Séances de Jean Formateur — alignées sur le planning élève + propositions. */
export const TRAINER_SESSIONS: TrainerSession[] = [
  {
    id: 'sess-0',
    subject: 'Mathématiques',
    chapter: 'Probabilités',
    date: '2026-11-22',
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'COMPLETED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 18,
    pricing: 'PAID',
    priceCfa: 1500,
    objectives: 'Réviser les probabilités conditionnelles.',
    hasExam: false,
    hasCorrection: true,
  },
  {
    id: 'sess-8',
    subject: 'Mathématiques',
    chapter: 'Dérivation et applications',
    date: '2026-11-21',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'COMPLETED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 18,
    seatsTaken: 14,
    pricing: 'PAID',
    priceCfa: 1500,
    hasExam: false,
    hasCorrection: true,
  },
  {
    id: 'sess-1',
    subject: 'Mathématiques',
    chapter: 'Fonctions logarithmes',
    date: '2026-11-25',
    startTime: '16:00',
    endTime: '19:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 25,
    seatsTaken: 8,
    pricing: 'PAID',
    priceCfa: 2000,
    objectives: 'Maîtriser ln et applications aux équations.',
    hasExam: true,
    hasCorrection: true,
  },
  {
    id: 'sess-13',
    subject: 'Mathématiques',
    chapter: 'Intégrales',
    date: '2026-11-28',
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 18,
    seatsTaken: 0,
    pricing: 'PAID',
    priceCfa: 1500,
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 't-sess-pending-1',
    subject: 'Mathématiques',
    chapter: 'Équations différentielles',
    date: '2026-12-06',
    startTime: '15:00',
    endTime: '17:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PENDING',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 0,
    pricing: 'PAID',
    priceCfa: 2000,
    objectives: 'Introduire y′ = ay + b.',
    proposalNote:
      'Proposition admin — créneau libre sur votre programme du dimanche.',
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 'sess-3',
    subject: 'Mathématiques',
    chapter: 'Suites numériques',
    date: '2026-12-02',
    startTime: '16:00',
    endTime: '19:00',
    room: 'Salle A05',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'POSTPONED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 15,
    pricing: 'PAID',
    priceCfa: 1500,
    statusNote: 'Report demandé par l’établissement — nouvelle salle A05.',
    hasExam: true,
    hasCorrection: false,
  },
  {
    id: 'sess-17',
    subject: 'Mathématiques',
    chapter: 'Nombres complexes',
    date: '2026-12-05',
    startTime: '10:00',
    endTime: '12:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 13,
    pricing: 'FREE',
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 't-sess-rejected-1',
    subject: 'Mathématiques',
    chapter: 'Statistiques descriptives',
    date: '2026-12-13',
    startTime: '16:00',
    endTime: '18:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'REJECTED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 0,
    pricing: 'PAID',
    priceCfa: 1500,
    statusNote: 'Créneau déjà réservé pour un bac blanc.',
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 'sess-5',
    subject: 'Mathématiques',
    chapter: 'Géométrie dans l’espace',
    date: '2026-12-09',
    startTime: '16:00',
    endTime: '19:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'CANCELLED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 20,
    pricing: 'PAID',
    priceCfa: 1500,
    statusNote: 'Annulée — formateur indisponible.',
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 'sess-21',
    subject: 'Mathématiques',
    chapter: 'Limites et continuité',
    date: '2026-12-12',
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 20,
    seatsTaken: 11,
    pricing: 'PAID',
    priceCfa: 1500,
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 't-sess-pending-2',
    subject: 'Mathématiques',
    chapter: 'Probabilités conditionnelles (approfondissement)',
    date: '2026-12-16',
    startTime: '16:00',
    endTime: '19:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PENDING',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 22,
    seatsTaken: 0,
    pricing: 'FREE',
    objectives: 'Préparer le bac blanc du 17 déc.',
    proposalNote: 'Séance gratuite proposée pour les révisions bac blanc.',
    hasExam: false,
    hasCorrection: false,
  },
  {
    id: 'sess-24',
    subject: 'Mathématiques',
    chapter: 'Révisions bac blanc',
    date: '2026-12-19',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Amphi 1',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale D',
    status: 'PUBLISHED',
    establishmentName: ESTABLISHMENT,
    seatsTotal: 30,
    seatsTaken: 18,
    pricing: 'PAID',
    priceCfa: 2500,
    objectives: 'Révisions transversales avant le bac blanc.',
    hasExam: true,
    hasCorrection: false,
  },
]

/** Séances mock Jean uniquement (pour le planning admin). */
export function listTrainerMockSessions(): TrainerSession[] {
  return TRAINER_SESSIONS.map(resolveTrainerSession)
}

/** Séances du dashboard formateur : mocks + propositions admin (dont publiques). */
export function listTrainerSessions(
  trainerId: string = DEMO_TRAINER_ID,
): TrainerSession[] {
  const base = TRAINER_SESSIONS.map(resolveTrainerSession)
  const fromDemoPublic = getDemoPublicOfferSessionsForTrainer(trainerId)
    .map(mergeAdminSessionOverrides)
    .map((session) => resolveTrainerSession(adminSessionToTrainer(session)))
  const fromAdmin = getAdminExtraSessions()
    .map(mergeAdminSessionOverrides)
    .filter((session) => session.trainerId === trainerId)
    .map((session) => resolveTrainerSession(adminSessionToTrainer(session)))

  const byId = new Map<string, TrainerSession>()
  for (const session of [...base, ...fromDemoPublic, ...fromAdmin]) {
    byId.set(session.id, session)
  }
  return [...byId.values()]
}

export function getTrainerSessionById(
  id: string,
): TrainerSession | undefined {
  return listTrainerSessions().find((item) => item.id === id)
}

export function upcomingTrainerSessions(
  sessions: TrainerSession[] = listTrainerSessions(),
): TrainerSession[] {
  return sessions
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
}

export function countPendingTrainerSessions(): number {
  return listTrainerSessions().filter((session) => session.status === 'PENDING')
    .length
}

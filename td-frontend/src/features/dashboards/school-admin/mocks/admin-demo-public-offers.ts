import type {
  AdminSession,
  AdminSessionStatus,
} from '@/features/dashboards/school-admin/types'

const ESTABLISHMENT = 'Lycée Démo Porto-Novo'

type PublicOfferTrainerSeed = {
  id: string
  name: string
  sessionId: string
  status?: AdminSessionStatus
  statusNote?: string
  seatsTaken?: number
}

type PublicOfferSeed = {
  groupId: string
  subject: string
  chapter: string
  date: string
  startTime: string
  endTime: string
  room: string
  groupLabel: string
  classLabel: string
  pricing: AdminSession['pricing']
  priceCfa?: number
  objectives: string
  note: string
  trainers: PublicOfferTrainerSeed[]
  hasAdminExam?: boolean
  hasAdminCorrection?: boolean
}

function buildPublicOfferSessions(seed: PublicOfferSeed): AdminSession[] {
  const note = `Proposition publique — premier formateur qui valide obtient la séance.\n${seed.note}`
  return seed.trainers.map((trainer) => ({
    id: trainer.sessionId,
    subject: seed.subject,
    chapter: seed.chapter,
    date: seed.date,
    startTime: seed.startTime,
    endTime: seed.endTime,
    room: seed.room,
    groupLabel: seed.groupLabel,
    classLabel: seed.classLabel,
    status: trainer.status ?? 'PENDING',
    establishmentName: ESTABLISHMENT,
    trainerId: trainer.id,
    trainerName: trainer.name,
    seatsTotal: 20,
    seatsTaken: trainer.seatsTaken ?? 0,
    pricing: seed.pricing,
    priceCfa: seed.pricing === 'PAID' ? seed.priceCfa : undefined,
    objectives: seed.objectives,
    proposalNote: note,
    statusNote: trainer.statusNote,
    hasAdminExam: seed.hasAdminExam ?? true,
    hasAdminCorrection: seed.hasAdminCorrection ?? false,
    studentExamPublished: false,
    studentCorrectionPublished: false,
    offerGroupId: seed.groupId,
    isPublicOffer: true,
  }))
}

/**
 * Cas démo couverts :
 * 1. En attente (2 formateurs)
 * 2. Validée par Jean (Amina annulée)
 * 3. En attente (1 formateur)
 * 4. Validée par Amina (Jean annulé)
 * 5. En attente SVT (Paul)
 */
const PUBLIC_OFFER_SEEDS: PublicOfferSeed[] = [
  {
    groupId: 'offer-demo-phys-sat',
    subject: 'Physique-Chimie',
    chapter: 'Optique géométrique',
    date: '2026-11-29',
    startTime: '08:00',
    endTime: '10:30',
    room: 'Labo 1',
    groupLabel: 'TD Physique 1',
    classLabel: 'Terminale D',
    pricing: 'PAID',
    priceCfa: 1500,
    objectives: 'Relier lentilles et constructions de base.',
    note: 'Besoin urgent pour Terminale D.',
    hasAdminExam: true,
    hasAdminCorrection: true,
    trainers: [
      {
        id: 'user-trainer-1',
        name: 'Jean Formateur',
        sessionId: 'admin-public-demo-jean',
      },
      {
        id: 'user-trainer-2',
        name: 'Amina Koffi',
        sessionId: 'admin-public-demo-amina',
      },
    ],
  },
  {
    groupId: 'offer-demo-phys-forces',
    subject: 'Physique-Chimie',
    chapter: 'Forces et mouvement',
    date: '2026-12-05',
    startTime: '11:00',
    endTime: '13:00',
    room: 'Labo 2',
    groupLabel: 'TD Physique 1',
    classLabel: 'Terminale D',
    pricing: 'PAID',
    priceCfa: 1200,
    objectives: 'Appliquer les lois de Newton sur des cas simples.',
    note: 'Créneau samedi milieu de journée.',
    hasAdminExam: true,
    hasAdminCorrection: false,
    trainers: [
      {
        id: 'user-trainer-1',
        name: 'Jean Formateur',
        sessionId: 'admin-public-demo-forces-jean',
        status: 'PUBLISHED',
        seatsTaken: 4,
      },
      {
        id: 'user-trainer-2',
        name: 'Amina Koffi',
        sessionId: 'admin-public-demo-forces-amina',
        status: 'CANCELLED',
        statusNote:
          'Cette proposition publique a déjà été validée par Jean Formateur. Vous ne pouvez plus la valider.',
      },
    ],
  },
  {
    groupId: 'offer-demo-maths-limites',
    subject: 'Mathématiques',
    chapter: 'Limites et continuité',
    date: '2026-12-02',
    startTime: '16:00',
    endTime: '18:00',
    room: 'Salle B12',
    groupLabel: 'TD Maths A',
    classLabel: 'Terminale C',
    pricing: 'FREE',
    objectives: 'Maîtriser les formes indéterminées usuelles.',
    note: 'Séance gratuite proposée aux Terminale C.',
    hasAdminExam: true,
    hasAdminCorrection: true,
    trainers: [
      {
        id: 'user-trainer-1',
        name: 'Jean Formateur',
        sessionId: 'admin-public-demo-limites-jean',
      },
    ],
  },
  {
    groupId: 'offer-demo-phys-thermo',
    subject: 'Physique-Chimie',
    chapter: 'Thermodynamique',
    date: '2026-12-06',
    startTime: '08:00',
    endTime: '10:30',
    room: 'Labo 1',
    groupLabel: 'TD Physique 1',
    classLabel: 'Terminale D',
    pricing: 'PAID',
    priceCfa: 1500,
    objectives: 'Bilan énergétique et premier principe.',
    note: 'Pack épreuve déjà joint — corrigé à compléter.',
    hasAdminExam: true,
    hasAdminCorrection: false,
    trainers: [
      {
        id: 'user-trainer-1',
        name: 'Jean Formateur',
        sessionId: 'admin-public-demo-thermo-jean',
        status: 'CANCELLED',
        statusNote:
          'Cette proposition publique a déjà été validée par Amina Koffi. Vous ne pouvez plus la valider.',
      },
      {
        id: 'user-trainer-2',
        name: 'Amina Koffi',
        sessionId: 'admin-public-demo-thermo-amina',
        status: 'PUBLISHED',
        seatsTaken: 2,
      },
    ],
  },
  {
    groupId: 'offer-demo-svt-immunologie',
    subject: 'SVT',
    chapter: 'Immunologie — réponses adaptatives',
    date: '2026-12-12',
    startTime: '08:00',
    endTime: '11:00',
    room: 'Salle C03',
    groupLabel: 'TD SVT B',
    classLabel: 'Terminale D',
    pricing: 'PAID',
    priceCfa: 1000,
    objectives: 'Schématiser la réponse immunitaire spécifique.',
    note: 'Ouverte aux formateurs SVT de l’établissement.',
    hasAdminExam: false,
    hasAdminCorrection: false,
    trainers: [
      {
        id: 'user-trainer-3',
        name: 'Paul Mensah',
        sessionId: 'admin-public-demo-immuno-paul',
      },
    ],
  },
]

/** Toutes les copies de séances liées aux offres publiques démo. */
export const DEMO_PUBLIC_OFFER_SESSIONS: AdminSession[] =
  PUBLIC_OFFER_SEEDS.flatMap(buildPublicOfferSessions)

/** @deprecated préférer les groupId dans PUBLIC_OFFER_SEEDS */
export const DEMO_PUBLIC_OFFER_GROUP_ID = 'offer-demo-phys-sat'

export function getDemoPublicOfferSessionsForTrainer(
  trainerId: string,
): AdminSession[] {
  return DEMO_PUBLIC_OFFER_SESSIONS.filter(
    (session) => session.trainerId === trainerId,
  )
}

export function listDemoPublicOfferGroupIds(): string[] {
  return PUBLIC_OFFER_SEEDS.map((seed) => seed.groupId)
}

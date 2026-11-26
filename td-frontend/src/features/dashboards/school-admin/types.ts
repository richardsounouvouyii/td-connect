import type {
  TrainerAdminPack,
  TrainerSessionPricing,
  TrainerSessionStatus,
} from '@/features/dashboards/trainer/types'

export type AdminSessionStatus = TrainerSessionStatus
export type AdminSessionPricing = TrainerSessionPricing

/** Séance vue côté admin établissement. */
export type AdminSession = {
  id: string
  subject: string
  chapter: string
  date: string
  startTime: string
  endTime: string
  room: string
  groupLabel: string
  classLabel: string
  status: AdminSessionStatus
  establishmentName: string
  trainerId: string
  trainerName: string
  seatsTotal: number
  seatsTaken: number
  pricing: AdminSessionPricing
  priceCfa?: number
  objectives?: string
  statusNote?: string
  proposalNote?: string
  /** Pack interne joint pour le formateur. */
  hasAdminExam: boolean
  hasAdminCorrection: boolean
  /** Publication élèves (suivi). */
  studentExamPublished?: boolean
  studentCorrectionPublished?: boolean
  /** Proposition publique : même offre envoyée à plusieurs formateurs. */
  offerGroupId?: string
  isPublicOffer?: boolean
}

export type AdminTrainerOption = {
  id: string
  fullName: string
  subjects: string[]
  /** Classes d’intervention (filtre proposition publique). */
  classes: string[]
}

/** Niveau scolaire géré (démo : 3ème + Terminale). */
export type AdminClassLevel = '3ème' | 'Terminale'

/** Groupe TD rattaché à une classe. */
export type AdminClassGroup = {
  id: string
  label: string
  subject: string
  studentCount: number
}

/** Classe de l’établissement (vue admin). */
export type AdminClass = {
  id: string
  label: string
  level: AdminClassLevel
  schoolYear: string
  studentCount: number
  groups: AdminClassGroup[]
  /** Ids formateurs qui interviennent sur cette classe. */
  trainerIds: string[]
}

export type AdminRoomOption = {
  id: string
  label: string
}

export type AdminAlert = {
  id: string
  message: string
  createdAt: string
  tone: 'info' | 'warning' | 'success'
  href?: string
}

export type AdminProposeSessionInput = {
  subject: string
  chapter: string
  date: string
  startTime: string
  endTime: string
  room: string
  groupLabel: string
  classLabel: string
  trainerId: string
  pricing: AdminSessionPricing
  priceCfa?: number
  objectives?: string
  proposalNote?: string
  adminPack?: TrainerAdminPack
  offerGroupId?: string
  isPublicOffer?: boolean
}

export type AdminProposePublicSessionInput = Omit<
  AdminProposeSessionInput,
  'trainerId' | 'offerGroupId' | 'isPublicOffer'
> & {
  trainerIds: string[]
}

/** Paramètres de l’établissement (fiche, horaires, politiques). */
export type AdminEstablishmentSettings = {
  name: string
  city: string
  address: string
  phone: string
  email: string
  schoolYear: string
  weekdaysLabel: string
  dayStart: string
  dayEnd: string
  requireTrainerValidation: boolean
  allowPublicOffers: boolean
  notifyStudentsOnPublish: boolean
  notifyTrainerOnPack: boolean
  adminPhone: string
  /** Labels de salles gérées localement (démo). */
  rooms: string[]
}

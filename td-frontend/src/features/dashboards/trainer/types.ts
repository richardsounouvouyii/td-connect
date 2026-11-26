export type TrainerSessionStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'POSTPONED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'

export type TrainerSessionPricing = 'FREE' | 'PAID'

export type TrainerSession = {
  id: string
  subject: string
  chapter: string
  date: string
  startTime: string
  endTime: string
  room: string
  groupLabel: string
  classLabel: string
  status: TrainerSessionStatus
  establishmentName: string
  seatsTotal: number
  seatsTaken: number
  /** Tarif proposé par l’admin (visible avant acceptation). */
  pricing: TrainerSessionPricing
  /** Montant élève en FCFA si pricing === 'PAID'. */
  priceCfa?: number
  objectives?: string
  /** Motif si rejetée / annulée / reportée. */
  statusNote?: string
  /** Message admin joint à la proposition. */
  proposalNote?: string
  hasExam?: boolean
  hasCorrection?: boolean
}

export type TrainerAlert = {
  id: string
  message: string
  createdAt: string
  tone: 'info' | 'warning' | 'success'
}

/** 1 = lundi … 7 = dimanche. */
export type TrainerWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type TrainerRecurringSlot = {
  id: string
  weekday: TrainerWeekday
  startTime: string
  endTime: string
  establishmentName: string
  active: boolean
}

export type TrainerAvailabilityException = {
  id: string
  date: string
  kind: 'UNAVAILABLE' | 'EXTRA'
  startTime?: string
  endTime?: string
  note?: string
}

export type TrainerDocumentKind = 'EXAM' | 'CORRECTION'

/** Épreuve ou corrigé publié par le formateur pour une séance. */
export type TrainerDocument = {
  id: string
  kind: TrainerDocumentKind
  sessionId: string
  title: string
  subject: string
  chapter: string
  publishedAt: string
  fileName: string
  fileSizeLabel: string
  pages: number
}

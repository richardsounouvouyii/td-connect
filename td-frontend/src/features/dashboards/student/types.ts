export type SessionStatus =
  | 'PUBLISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'COMPLETED'

export type SessionPricing = 'FREE' | 'PAID'

export type StudentSession = {
  id: string
  subject: string
  chapter: string
  date: string
  startTime: string
  endTime: string
  room: string
  trainerName: string
  groupLabel: string
  status: SessionStatus
  establishmentName: string
  pricing: SessionPricing
  /** Prix en FCFA — uniquement si pricing === 'PAID'. */
  priceCfa?: number
  /** Capacité totale de la séance. */
  seatsTotal: number
  /** Places déjà prises (hors ajustement local d’inscription). */
  seatsTaken: number
  /** Déjà inscrit (état initial mock). */
  joined?: boolean
}

export type StudentDocument = {
  id: string
  title: string
  kind: 'EXAM' | 'CORRECTION'
  subject: string
  chapter: string
  trainerName: string
  publishedAt: string
  linkedSessionId?: string
  fileName: string
  fileSizeLabel: string
  pages: number
  /** PDF publié par le formateur — téléchargeable. */
  downloadable: boolean
  /** Déjà consulté par l’élève (démo). */
  seen?: boolean
}

export type StudentAlert = {
  id: string
  message: string
  createdAt: string
  tone: 'info' | 'warning' | 'success'
}

export type StudentNotificationKind =
  | 'SESSION_PUBLISHED'
  | 'SESSION_POSTPONED'
  | 'SESSION_CANCELLED'
  | 'EXAM_PUBLISHED'
  | 'CORRECTION_PUBLISHED'
  | 'REMINDER'

export type StudentNotification = {
  id: string
  title: string
  message: string
  kind: StudentNotificationKind
  createdAt: string
  read: boolean
  linkedSessionId?: string
  /** Lien catalogue épreuves quand pertinent. */
  linkedToExams?: boolean
}

/** Infos scolaires / contact élève (hors AuthUser). */
export type StudentProfile = {
  classLabel: string
  groups: string[]
  schoolYear: string
  levelLabel: string
  phone: string
}

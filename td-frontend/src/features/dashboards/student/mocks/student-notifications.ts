import type {
  StudentAlert,
  StudentNotification,
} from '@/features/dashboards/student/types'

/** Alertes démo élève — alignées sur les séances / documents existants. */
export const STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-1',
    title: 'Séance reportée',
    message: 'La séance Maths du 2 déc. est reportée (nouvelle salle A05).',
    kind: 'SESSION_POSTPONED',
    createdAt: '2026-11-25',
    read: false,
    linkedSessionId: 'sess-8',
  },
  {
    id: 'notif-2',
    title: 'Nouvelle épreuve',
    message: 'Nouvelle épreuve publiée : Logarithmes.',
    kind: 'EXAM_PUBLISHED',
    createdAt: '2026-11-24',
    read: false,
    linkedToExams: true,
  },
  {
    id: 'notif-3',
    title: 'Séance reportée',
    message: 'Séance SVT du 16 déc. reportée — horaire à confirmer.',
    kind: 'SESSION_POSTPONED',
    createdAt: '2026-11-25',
    read: false,
    linkedSessionId: 'sess-12',
  },
  {
    id: 'notif-4',
    title: 'Rappel bac blanc',
    message: 'Bac blanc Maths + Physique le 17 déc. (Amphi 1).',
    kind: 'REMINDER',
    createdAt: '2026-11-23',
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Corrigé disponible',
    message: 'Corrigé publié : Mécanique forces.',
    kind: 'CORRECTION_PUBLISHED',
    createdAt: '2026-11-25',
    read: false,
    linkedSessionId: 'sess-9',
    linkedToExams: true,
  },
  {
    id: 'notif-6',
    title: 'Nouvelle séance',
    message: 'TD Physique publié : Mécanique — forces (salle B12).',
    kind: 'SESSION_PUBLISHED',
    createdAt: '2026-11-22',
    read: true,
    linkedSessionId: 'sess-9',
  },
  {
    id: 'notif-7',
    title: 'Séance annulée',
    message: 'La séance Électricité du 20 nov. a été annulée par l’établissement.',
    kind: 'SESSION_CANCELLED',
    createdAt: '2026-11-19',
    read: true,
    linkedSessionId: 'sess-2',
  },
  {
    id: 'notif-8',
    title: 'Rappel séance',
    message: 'Rappel : TD Maths Logarithmes demain à 14 h (salle A03).',
    kind: 'REMINDER',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'sess-1',
  },
  {
    id: 'notif-9',
    title: 'Nouvelle épreuve',
    message: 'Épreuve Immunologie disponible au téléchargement.',
    kind: 'EXAM_PUBLISHED',
    createdAt: '2026-11-26',
    read: false,
    linkedToExams: true,
  },
]

function toneForKind(
  kind: StudentNotification['kind'],
): StudentAlert['tone'] {
  switch (kind) {
    case 'SESSION_POSTPONED':
    case 'SESSION_CANCELLED':
      return 'warning'
    case 'SESSION_PUBLISHED':
    case 'CORRECTION_PUBLISHED':
      return 'success'
    default:
      return 'info'
  }
}

/** Aperçu accueil — 4 alertes les plus récentes. */
export const STUDENT_RECENT_ALERTS: StudentAlert[] = [...STUDENT_NOTIFICATIONS]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 4)
  .map((notif) => ({
    id: notif.id,
    message: notif.message,
    createdAt: notif.createdAt,
    tone: toneForKind(notif.kind),
  }))

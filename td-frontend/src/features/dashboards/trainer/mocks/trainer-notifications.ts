import type {
  TrainerAlert,
  TrainerNotification,
} from '@/features/dashboards/trainer/types'

/** Alertes démo formateur — alignées sur séances / documents. */
export const TRAINER_NOTIFICATIONS: TrainerNotification[] = [
  {
    id: 't-notif-1',
    title: 'Séance à valider',
    message:
      'Proposition « Équations différentielles » — 2 000 F. À valider ou refuser.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 't-sess-pending-1',
  },
  {
    id: 't-notif-2',
    title: 'Séance à valider',
    message:
      'Proposition gratuite « Probabilités conditionnelles » — à valider ou refuser.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 't-sess-pending-2',
  },
  {
    id: 't-notif-3',
    title: 'Épreuve manquante',
    message:
      'Séance Intégrales (28 nov.) : aucune épreuve publiée — complètez Documents.',
    kind: 'EXAM_MISSING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'sess-13',
    linkedToDocuments: true,
  },
  {
    id: 't-notif-4',
    title: 'Aucune inscription',
    message:
      'Séance Intégrales publiée : 0 / 18 places. Surveillez les inscriptions.',
    kind: 'NO_ENROLLMENT',
    createdAt: '2026-11-25',
    read: false,
    linkedSessionId: 'sess-13',
  },
  {
    id: 't-notif-5',
    title: 'Séance reportée',
    message: 'Suites numériques reportée — salle A05 confirmée.',
    kind: 'SESSION_POSTPONED',
    createdAt: '2026-11-25',
    read: true,
    linkedSessionId: 'sess-3',
  },
  {
    id: 't-notif-6',
    title: 'Rappel séance',
    message: 'Demain : Logarithmes 16:00–19:00 (Salle B12).',
    kind: 'REMINDER',
    createdAt: '2026-11-24',
    read: false,
    linkedSessionId: 'sess-1',
  },
  {
    id: 't-notif-7',
    title: 'Proposition refusée',
    message:
      'Statistiques descriptives refusée (conflit bac blanc) — créneau admin.',
    kind: 'SESSION_REFUSED',
    createdAt: '2026-11-24',
    read: true,
    linkedSessionId: 't-sess-rejected-1',
  },
  {
    id: 't-notif-8',
    title: 'Séance annulée',
    message: 'Géométrie dans l’espace annulée — formateur indisponible.',
    kind: 'SESSION_CANCELLED',
    createdAt: '2026-11-23',
    read: true,
    linkedSessionId: 'sess-5',
  },
]

/** Aperçu Accueil — 3 dernières non lues d’abord. */
export const TRAINER_RECENT_ALERTS: TrainerAlert[] = [
  {
    id: 't-alert-1',
    message:
      'Proposition admin « Équations différentielles » — à valider (prix inclus).',
    createdAt: '2026-11-26',
    tone: 'warning',
  },
  {
    id: 't-alert-2',
    message: 'Épreuve manquante pour Intégrales — publiez dans Documents.',
    createdAt: '2026-11-26',
    tone: 'warning',
  },
  {
    id: 't-alert-3',
    message: 'Séance Suites numériques reportée — salle A05 confirmée.',
    createdAt: '2026-11-25',
    tone: 'info',
  },
]

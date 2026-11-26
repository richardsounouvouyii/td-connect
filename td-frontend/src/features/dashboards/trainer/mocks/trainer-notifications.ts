import type {
  TrainerAlert,
  TrainerNotification,
} from '@/features/dashboards/trainer/types'

/** Alertes démo formateur — alignées sur séances / documents. */
export const TRAINER_NOTIFICATIONS: TrainerNotification[] = [
  {
    id: 't-notif-public-demo',
    title: 'Proposition publique',
    message:
      'Offre publique « Optique géométrique » (Physique-Chimie) — premier qui valide obtient la séance.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'admin-public-demo-jean',
  },
  {
    id: 't-notif-public-demo-2',
    title: 'Proposition publique',
    message:
      'Offre publique « Forces et mouvement » — samedi 11:00–13:00.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'admin-public-demo-forces-jean',
  },
  {
    id: 't-notif-public-demo-3',
    title: 'Proposition publique',
    message:
      'Offre publique gratuite « Limites et continuité » — mercredi 16:00–18:00.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'admin-public-demo-limites-jean',
  },
  {
    id: 't-notif-public-demo-4',
    title: 'Proposition publique',
    message:
      'Offre publique « Thermodynamique » — samedi 08:00–10:30.',
    kind: 'PROPOSAL_PENDING',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'admin-public-demo-thermo-jean',
  },
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
    title: 'Pack admin reçu',
    message:
      'Épreuve + corrigé joints pour Intégrales — téléchargez-les dans Documents pour préparer.',
    kind: 'ADMIN_PACK_READY',
    createdAt: '2026-11-26',
    read: false,
    linkedSessionId: 'sess-13',
    linkedToDocuments: true,
  },
  {
    id: 't-notif-3b',
    title: 'Pack admin reçu',
    message:
      'Épreuve + corrigé joints pour Révisions bac blanc — disponibles dans Documents.',
    kind: 'ADMIN_PACK_READY',
    createdAt: '2026-11-25',
    read: false,
    linkedSessionId: 'sess-24',
    linkedToDocuments: true,
  },
  {
    id: 't-notif-3c',
    title: 'Épreuve manquante',
    message:
      'Séance Intégrales : pack admin reçu, mais pas encore publié aux élèves.',
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
    message:
      'Pack admin reçu pour Intégrales — téléchargez épreuve + corrigé dans Documents.',
    createdAt: '2026-11-26',
    tone: 'info',
  },
  {
    id: 't-alert-3',
    message: 'Séance Suites numériques reportée — salle A05 confirmée.',
    createdAt: '2026-11-25',
    tone: 'info',
  },
]

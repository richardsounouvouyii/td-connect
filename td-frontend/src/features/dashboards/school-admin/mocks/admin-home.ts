import {
  countAdminMissingPackPlanningRows,
  countAdminPendingPlanningRows,
  listUpcomingAdminPlanningRows,
} from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import { listAdminClasses } from '@/features/dashboards/school-admin/mocks/admin-classes'
import { ADMIN_TRAINERS } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import type { AdminAlert } from '@/features/dashboards/school-admin/types'

export function getAdminHomeStats() {
  const upcomingRows = listUpcomingAdminPlanningRows(20).filter((row) => {
    const status = row.kind === 'session' ? row.session.status : row.status
    return status === 'PUBLISHED' || status === 'POSTPONED'
  })
  return {
    pendingTrainer: countAdminPendingPlanningRows(),
    missingPacks: countAdminMissingPackPlanningRows(),
    upcoming: upcomingRows.length,
    trainers: ADMIN_TRAINERS.length,
    classes: listAdminClasses().length,
  }
}

export const ADMIN_RECENT_ALERTS: AdminAlert[] = [
  {
    id: 'a-alert-public-1',
    message:
      'Offres publiques : en attente + déjà validées (Jean / Amina) — filtre « Publiques ».',
    createdAt: '2026-11-26',
    tone: 'warning',
    href: '/admin-etablissement/planning?statut=PUBLIC',
  },
  {
    id: 'a-alert-1',
    message:
      '2 propositions en attente de validation formateur (Jean, Amina).',
    createdAt: '2026-11-26',
    tone: 'warning',
    href: '/admin-etablissement/planning?statut=PENDING',
  },
  {
    id: 'a-alert-2',
    message:
      'Pack incomplet pour Immunologie (Paul Mensah) — joindre le corrigé.',
    createdAt: '2026-11-26',
    tone: 'warning',
    href: '/admin-etablissement/documents?pack=MISSING',
  },
  {
    id: 'a-alert-3',
    message: 'Suites numériques reportée — salle A05 confirmée.',
    createdAt: '2026-11-25',
    tone: 'info',
    href: '/admin-etablissement/planning/sess-3',
  },
]

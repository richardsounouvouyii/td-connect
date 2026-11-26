import { getAdminSessionPack } from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import type { TrainerAdminPack } from '@/features/dashboards/trainer/types'

/**
 * Packs PDF envoyés par l’admin au formateur (préparation).
 * Indépendants de la publication élèves.
 */
const TRAINER_ADMIN_PACKS: Record<string, TrainerAdminPack> = {
  'sess-0': {
    exam: {
      fileName: 'admin-epreuve-probabilites.pdf',
      fileSizeLabel: '210 Ko',
      pages: 3,
      providedAt: '2026-11-18',
    },
    correction: {
      fileName: 'admin-corrige-probabilites.pdf',
      fileSizeLabel: '198 Ko',
      pages: 2,
      providedAt: '2026-11-18',
    },
  },
  'sess-8': {
    exam: {
      fileName: 'admin-epreuve-derivation.pdf',
      fileSizeLabel: '255 Ko',
      pages: 4,
      providedAt: '2026-11-19',
    },
    correction: {
      fileName: 'admin-corrige-derivation.pdf',
      fileSizeLabel: '240 Ko',
      pages: 3,
      providedAt: '2026-11-19',
    },
  },
  'sess-1': {
    exam: {
      fileName: 'admin-epreuve-logarithmes.pdf',
      fileSizeLabel: '312 Ko',
      pages: 4,
      providedAt: '2026-11-23',
    },
    correction: {
      fileName: 'admin-corrige-logarithmes.pdf',
      fileSizeLabel: '280 Ko',
      pages: 3,
      providedAt: '2026-11-23',
    },
  },
  /** Pack complet, publication élèves encore vide → bon cas démo. */
  'sess-13': {
    exam: {
      fileName: 'admin-epreuve-integrales.pdf',
      fileSizeLabel: '340 Ko',
      pages: 5,
      providedAt: '2026-11-26',
    },
    correction: {
      fileName: 'admin-corrige-integrales.pdf',
      fileSizeLabel: '290 Ko',
      pages: 4,
      providedAt: '2026-11-26',
    },
  },
  'sess-3': {
    exam: {
      fileName: 'admin-epreuve-suites.pdf',
      fileSizeLabel: '290 Ko',
      pages: 4,
      providedAt: '2026-11-20',
    },
    correction: {
      fileName: 'admin-corrige-suites.pdf',
      fileSizeLabel: '260 Ko',
      pages: 3,
      providedAt: '2026-11-20',
    },
  },
  'sess-24': {
    exam: {
      fileName: 'admin-epreuve-revisions-bac.pdf',
      fileSizeLabel: '420 Ko',
      pages: 6,
      providedAt: '2026-11-25',
    },
    correction: {
      fileName: 'admin-corrige-revisions-bac.pdf',
      fileSizeLabel: '380 Ko',
      pages: 5,
      providedAt: '2026-11-25',
    },
  },
  /** Proposition : pack déjà joint avant validation. */
  't-sess-pending-1': {
    exam: {
      fileName: 'admin-epreuve-equations-diff.pdf',
      fileSizeLabel: '275 Ko',
      pages: 4,
      providedAt: '2026-11-26',
    },
    correction: {
      fileName: 'admin-corrige-equations-diff.pdf',
      fileSizeLabel: '230 Ko',
      pages: 3,
      providedAt: '2026-11-26',
    },
  },
}

export function getTrainerAdminPack(
  sessionId: string,
): TrainerAdminPack | undefined {
  return getAdminSessionPack(sessionId) ?? TRAINER_ADMIN_PACKS[sessionId]
}

export function sessionHasAdminPack(sessionId: string): boolean {
  const pack = TRAINER_ADMIN_PACKS[sessionId]
  return Boolean(pack?.exam || pack?.correction)
}

export function listAdminPackSessionIds(): string[] {
  return Object.keys(TRAINER_ADMIN_PACKS).filter(sessionHasAdminPack)
}

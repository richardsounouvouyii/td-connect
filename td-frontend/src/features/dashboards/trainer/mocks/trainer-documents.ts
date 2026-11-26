import type { TrainerDocument } from '@/features/dashboards/trainer/types'

/** Documents de Jean Formateur — alignés sur les épreuves élève. */
export const TRAINER_DOCUMENTS: TrainerDocument[] = [
  {
    id: 'tdoc-1',
    kind: 'EXAM',
    sessionId: 'sess-1',
    title: 'Épreuve — Logarithmes',
    subject: 'Mathématiques',
    chapter: 'Fonctions logarithmes',
    publishedAt: '2026-11-24',
    fileName: 'epreuve-logarithmes.pdf',
    fileSizeLabel: '312 Ko',
    pages: 4,
  },
  {
    id: 'tdoc-1b',
    kind: 'CORRECTION',
    sessionId: 'sess-1',
    title: 'Corrigé — Logarithmes',
    subject: 'Mathématiques',
    chapter: 'Fonctions logarithmes',
    publishedAt: '2026-11-26',
    fileName: 'corrige-logarithmes.pdf',
    fileSizeLabel: '280 Ko',
    pages: 3,
  },
  {
    id: 'tdoc-2',
    kind: 'CORRECTION',
    sessionId: 'sess-0',
    title: 'Corrigé — Probabilités',
    subject: 'Mathématiques',
    chapter: 'Probabilités',
    publishedAt: '2026-11-22',
    fileName: 'corrige-probabilites.pdf',
    fileSizeLabel: '198 Ko',
    pages: 2,
  },
  {
    id: 'tdoc-9',
    kind: 'CORRECTION',
    sessionId: 'sess-8',
    title: 'Corrigé — Dérivation',
    subject: 'Mathématiques',
    chapter: 'Dérivation et applications',
    publishedAt: '2026-11-24',
    fileName: 'corrige-derivation.pdf',
    fileSizeLabel: '240 Ko',
    pages: 3,
  },
  {
    id: 'tdoc-10',
    kind: 'EXAM',
    sessionId: 'sess-3',
    title: 'Épreuve — Suites numériques',
    subject: 'Mathématiques',
    chapter: 'Suites numériques',
    publishedAt: '2026-11-21',
    fileName: 'epreuve-suites.pdf',
    fileSizeLabel: '290 Ko',
    pages: 4,
  },
  {
    id: 'tdoc-24',
    kind: 'EXAM',
    sessionId: 'sess-24',
    title: 'Épreuve — Révisions bac blanc',
    subject: 'Mathématiques',
    chapter: 'Révisions bac blanc',
    publishedAt: '2026-11-25',
    fileName: 'epreuve-revisions-bac.pdf',
    fileSizeLabel: '420 Ko',
    pages: 6,
  },
]

export function getTrainerDocument(
  documents: TrainerDocument[],
  sessionId: string,
  kind: TrainerDocument['kind'],
): TrainerDocument | undefined {
  return documents.find(
    (doc) => doc.sessionId === sessionId && doc.kind === kind,
  )
}

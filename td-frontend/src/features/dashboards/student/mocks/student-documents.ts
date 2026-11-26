import type { StudentDocument } from '@/features/dashboards/student/types'

/**
 * Catalogue démo épreuves / corrigés.
 * Règle métier : l’épreuve peut paraître avant la séance ;
 * le corrigé n’apparaît que lorsqu’il est publié (après la séance).
 */
export const STUDENT_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-1',
    title: 'Épreuve — Logarithmes',
    kind: 'EXAM',
    subject: 'Mathématiques',
    chapter: 'Fonctions logarithmes',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-24',
    linkedSessionId: 'sess-1',
    fileName: 'epreuve-logarithmes.pdf',
    fileSizeLabel: '312 Ko',
    pages: 4,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-1b',
    title: 'Corrigé — Logarithmes',
    kind: 'CORRECTION',
    subject: 'Mathématiques',
    chapter: 'Fonctions logarithmes',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-26',
    linkedSessionId: 'sess-1',
    fileName: 'corrige-logarithmes.pdf',
    fileSizeLabel: '280 Ko',
    pages: 3,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-2',
    title: 'Épreuve — Probabilités',
    kind: 'EXAM',
    subject: 'Mathématiques',
    chapter: 'Probabilités',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-18',
    linkedSessionId: 'sess-0',
    fileName: 'epreuve-probabilites.pdf',
    fileSizeLabel: '210 Ko',
    pages: 3,
    downloadable: true,
    seen: true,
  },
  {
    id: 'doc-2b',
    title: 'Corrigé — Probabilités',
    kind: 'CORRECTION',
    subject: 'Mathématiques',
    chapter: 'Probabilités',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-22',
    linkedSessionId: 'sess-0',
    fileName: 'corrige-probabilites.pdf',
    fileSizeLabel: '198 Ko',
    pages: 2,
    downloadable: true,
    seen: true,
  },
  {
    id: 'doc-3',
    title: 'Épreuve — Mécanique forces',
    kind: 'EXAM',
    subject: 'Physique-Chimie',
    chapter: 'Mécanique — forces',
    trainerName: 'Amina Koffi',
    publishedAt: '2026-11-25',
    linkedSessionId: 'sess-9',
    fileName: 'epreuve-mecanique-forces.pdf',
    fileSizeLabel: '356 Ko',
    pages: 5,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-3b',
    title: 'Corrigé — Mécanique forces',
    kind: 'CORRECTION',
    subject: 'Physique-Chimie',
    chapter: 'Mécanique — forces',
    trainerName: 'Amina Koffi',
    publishedAt: '2026-11-25',
    linkedSessionId: 'sess-9',
    fileName: 'corrige-mecanique-forces.pdf',
    fileSizeLabel: '264 Ko',
    pages: 4,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-4',
    title: 'Épreuve — Génétique',
    kind: 'EXAM',
    subject: 'SVT',
    chapter: 'Génétique mendélienne',
    trainerName: 'Paul Mensah',
    publishedAt: '2026-11-20',
    linkedSessionId: 'sess-7',
    fileName: 'epreuve-genetique.pdf',
    fileSizeLabel: '245 Ko',
    pages: 4,
    downloadable: true,
    seen: true,
  },
  {
    id: 'doc-4b',
    title: 'Corrigé — Génétique',
    kind: 'CORRECTION',
    subject: 'SVT',
    chapter: 'Génétique mendélienne',
    trainerName: 'Paul Mensah',
    publishedAt: '2026-11-24',
    linkedSessionId: 'sess-7',
    fileName: 'corrige-genetique.pdf',
    fileSizeLabel: '220 Ko',
    pages: 3,
    downloadable: true,
    seen: true,
  },
  {
    id: 'doc-5',
    title: 'Épreuve — Immunologie',
    kind: 'EXAM',
    subject: 'SVT',
    chapter: 'Immunologie',
    trainerName: 'Paul Mensah',
    publishedAt: '2026-11-26',
    linkedSessionId: 'sess-12',
    fileName: 'epreuve-immunologie.pdf',
    fileSizeLabel: '410 Ko',
    pages: 6,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-6',
    title: 'Épreuve — Électricité',
    kind: 'EXAM',
    subject: 'Physique-Chimie',
    chapter: 'Électricité',
    trainerName: 'Amina Koffi',
    publishedAt: '2026-11-26',
    linkedSessionId: 'sess-2',
    fileName: 'epreuve-electricite.pdf',
    fileSizeLabel: '190 Ko',
    pages: 3,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-8',
    title: 'Épreuve — Dérivation',
    kind: 'EXAM',
    subject: 'Mathématiques',
    chapter: 'Dérivation et applications',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-20',
    linkedSessionId: 'sess-8',
    fileName: 'epreuve-derivation.pdf',
    fileSizeLabel: '255 Ko',
    pages: 4,
    downloadable: true,
    seen: false,
  },
  {
    id: 'doc-10',
    title: 'Épreuve — Suites numériques',
    kind: 'EXAM',
    subject: 'Mathématiques',
    chapter: 'Suites numériques',
    trainerName: 'Jean Formateur',
    publishedAt: '2026-11-21',
    linkedSessionId: 'sess-3',
    fileName: 'epreuve-suites.pdf',
    fileSizeLabel: '290 Ko',
    pages: 4,
    downloadable: true,
    seen: true,
  },
]

export type StudentDocumentPack = {
  id: string
  subject: string
  chapter: string
  trainerName: string
  linkedSessionId?: string
  exam?: StudentDocument
  correction?: StudentDocument
  /** Date de référence pour le tri (dernier fichier publié). */
  publishedAt: string
  seen: boolean
}

export function getStudentDocumentById(
  id: string,
): StudentDocument | undefined {
  return STUDENT_DOCUMENTS.find((doc) => doc.id === id)
}

/** Document lié (épreuve ↔ corrigé) pour la même séance. */
export function getLinkedDocument(
  document: StudentDocument,
  kind: StudentDocument['kind'],
): StudentDocument | undefined {
  if (document.kind === kind) return document
  if (!document.linkedSessionId) return undefined
  return STUDENT_DOCUMENTS.find(
    (candidate) =>
      candidate.linkedSessionId === document.linkedSessionId &&
      candidate.kind === kind,
  )
}

/** Une carte catalogue = une séance (épreuve ± corrigé). */
export function listStudentDocumentPacks(
  documents: StudentDocument[] = STUDENT_DOCUMENTS,
): StudentDocumentPack[] {
  const packs = new Map<string, StudentDocumentPack>()

  for (const doc of documents) {
    const key = doc.linkedSessionId ?? doc.id
    const existing = packs.get(key)

    if (!existing) {
      packs.set(key, {
        id: key,
        subject: doc.subject,
        chapter: doc.chapter,
        trainerName: doc.trainerName,
        linkedSessionId: doc.linkedSessionId,
        exam: doc.kind === 'EXAM' ? doc : undefined,
        correction: doc.kind === 'CORRECTION' ? doc : undefined,
        publishedAt: doc.publishedAt,
        seen: true,
      })
      continue
    }

    if (doc.kind === 'EXAM') existing.exam = doc
    if (doc.kind === 'CORRECTION') existing.correction = doc
    if (doc.publishedAt > existing.publishedAt) {
      existing.publishedAt = doc.publishedAt
    }
  }

  return [...packs.values()].map((pack) => {
    const parts = [pack.exam, pack.correction].filter(Boolean) as StudentDocument[]
    return {
      ...pack,
      /** Nouveau si au moins un fichier publié n’a pas encore été vu. */
      seen: parts.length > 0 && parts.every((part) => Boolean(part.seen)),
    }
  })
}

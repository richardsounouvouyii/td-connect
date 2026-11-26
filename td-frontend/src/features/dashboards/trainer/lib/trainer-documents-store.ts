import { isBefore, parseISO, startOfDay } from 'date-fns'
import { PLANNING_DEMO_TODAY } from '@/features/dashboards/student/lib/planning'
import { TRAINER_DOCUMENTS } from '@/features/dashboards/trainer/mocks/trainer-documents'
import type {
  TrainerDocument,
  TrainerDocumentKind,
  TrainerSession,
} from '@/features/dashboards/trainer/types'

const STORAGE_KEY = 'tdc.trainer.documents'

function readStored(): TrainerDocument[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed as TrainerDocument[]
  } catch {
    return null
  }
}

export function loadTrainerDocuments(): TrainerDocument[] {
  return readStored() ?? [...TRAINER_DOCUMENTS]
}

export function saveTrainerDocuments(documents: TrainerDocument[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}

export function formatFileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  const ko = Math.round(bytes / 1024)
  if (ko < 1024) return `${ko} Ko`
  return `${(ko / 1024).toFixed(1).replace('.', ',')} Mo`
}

export function buildDocumentFromFile(
  session: TrainerSession,
  kind: TrainerDocumentKind,
  file: File,
): TrainerDocument {
  const isExam = kind === 'EXAM'
  const label = isExam ? 'Épreuve' : 'Corrigé'
  const fileName = file.name.toLowerCase().endsWith('.pdf')
    ? file.name
    : `${file.name}.pdf`

  return {
    id: `tdoc-${session.id}-${kind.toLowerCase()}-${Date.now()}`,
    kind,
    sessionId: session.id,
    title: `${label} — ${session.chapter}`,
    subject: session.subject,
    chapter: session.chapter,
    publishedAt: new Date().toISOString().slice(0, 10),
    fileName,
    fileSizeLabel: formatFileSizeLabel(file.size || 1),
    pages: isExam ? 4 : 3,
  }
}

/** La séance est passée (jour J terminé) ou déjà marquée Terminée. */
export function isSessionPastForCorrection(
  session: TrainerSession,
  today: Date = PLANNING_DEMO_TODAY,
): boolean {
  if (session.status === 'COMPLETED') return true
  return isBefore(startOfDay(parseISO(session.date)), startOfDay(today))
}

export function canPublishExam(_session: TrainerSession): {
  ok: true
} | { ok: false; message: string } {
  return { ok: true }
}

export function canPublishCorrection(
  session: TrainerSession,
  hasExam: boolean,
): { ok: true } | { ok: false; message: string } {
  if (!hasExam) {
    return {
      ok: false,
      message: 'Publiez d’abord l’épreuve de cette séance.',
    }
  }
  if (!isSessionPastForCorrection(session)) {
    return {
      ok: false,
      message:
        'Le corrigé se publie après la séance (journée passée ou statut Terminée).',
    }
  }
  return { ok: true }
}

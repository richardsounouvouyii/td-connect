import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Download,
  FileCheck2,
  FilePlus2,
  MapPin,
  RefreshCw,
  Trash2,
  Upload,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { downloadDemoPdf } from '@/features/dashboards/student/lib/download-demo-pdf'
import { AdminPrepPackBlock } from '@/features/dashboards/trainer/components/AdminPrepPackBlock'
import { TrainerSessionStatusBadge } from '@/features/dashboards/trainer/components/TrainerSessionStatusBadge'
import {
  formatSessionDate,
  formatShortDate,
  formatTrainerSessionPrice,
  trainerPricingLabel,
} from '@/features/dashboards/trainer/lib/format'
import {
  isAdminPackSeen,
  listEligibleAdminPackSessionIds,
  markAllAdminPacksSeen,
} from '@/features/dashboards/trainer/lib/trainer-admin-pack-reads'
import {
  buildDocumentFromFile,
  canPublishCorrection,
  canPublishExam,
  formatFileSizeLabel,
  loadTrainerDocuments,
  saveTrainerDocuments,
} from '@/features/dashboards/trainer/lib/trainer-documents-store'
import { getTrainerAdminPack } from '@/features/dashboards/trainer/mocks/trainer-admin-packs'
import { getTrainerDocument } from '@/features/dashboards/trainer/mocks/trainer-documents'
import { listTrainerSessions } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type {
  TrainerDocument,
  TrainerDocumentKind,
  TrainerSession,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type DocsFilter = 'ALL' | 'MISSING' | 'COMPLETE'

const ELIGIBLE_STATUSES: TrainerSession['status'][] = [
  'PUBLISHED',
  'POSTPONED',
  'COMPLETED',
]

type FileIntent =
  | { mode: 'publish'; sessionId: string; kind: TrainerDocumentKind }
  | { mode: 'replace'; documentId: string }

/** Catalogue épreuves / corrigés du formateur, groupés par séance. */
export function TrainerDocumentsPage() {
  const { pushToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<TrainerDocument[]>(() =>
    loadTrainerDocuments(),
  )
  const [filter, setFilter] = useState<DocsFilter>('ALL')
  const [pendingRemove, setPendingRemove] = useState<TrainerDocument | null>(
    null,
  )
  const [fileIntent, setFileIntent] = useState<FileIntent | null>(null)
  /** Snapshot des packs « nouveaux » avant de marquer la page comme vue. */
  const [newPackIds] = useState(() =>
    listEligibleAdminPackSessionIds().filter((id) => !isAdminPackSeen(id)),
  )

  useEffect(() => {
    markAllAdminPacksSeen()
  }, [])

  const persist = (next: TrainerDocument[]) => {
    setDocuments(next)
    saveTrainerDocuments(next)
  }

  const sessions = useMemo(
    () =>
      listTrainerSessions()
        .filter((session) => ELIGIBLE_STATUSES.includes(session.status))
        .sort((a, b) => {
          const byDate = b.date.localeCompare(a.date)
          if (byDate !== 0) return byDate
          return b.startTime.localeCompare(a.startTime)
        }),
    [],
  )

  const rows = useMemo(() => {
    return sessions
      .map((session) => {
        const exam = getTrainerDocument(documents, session.id, 'EXAM')
        const correction = getTrainerDocument(
          documents,
          session.id,
          'CORRECTION',
        )
        const missingCount = (exam ? 0 : 1) + (correction ? 0 : 1)
        return { session, exam, correction, missingCount }
      })
      .filter((row) => {
        if (filter === 'MISSING') return row.missingCount > 0
        if (filter === 'COMPLETE') return row.missingCount === 0
        return true
      })
  }, [documents, filter, sessions])

  const missingTotal = useMemo(
    () =>
      sessions.reduce((count, session) => {
        const exam = getTrainerDocument(documents, session.id, 'EXAM')
        const correction = getTrainerDocument(
          documents,
          session.id,
          'CORRECTION',
        )
        return count + (exam ? 0 : 1) + (correction ? 0 : 1)
      }, 0),
    [documents, sessions],
  )

  const openFilePicker = (intent: FileIntent) => {
    setFileIntent(intent)
    window.setTimeout(() => fileInputRef.current?.click(), 0)
  }

  const requestPublish = (
    session: TrainerSession,
    kind: TrainerDocumentKind,
  ) => {
    if (kind === 'EXAM') {
      const gate = canPublishExam(session)
      if (!gate.ok) {
        pushToast({
          title: 'Publication impossible',
          description: gate.message,
          tone: 'warning',
        })
        return
      }
    } else {
      const hasExam = Boolean(
        getTrainerDocument(documents, session.id, 'EXAM'),
      )
      const gate = canPublishCorrection(session, hasExam)
      if (!gate.ok) {
        pushToast({
          title: 'Corrigé non disponible',
          description: gate.message,
          tone: 'warning',
        })
        return
      }
    }

    if (getTrainerDocument(documents, session.id, kind)) {
      pushToast({
        title: 'Déjà publié',
        description: 'Utilisez Remplacer pour changer le fichier.',
        tone: 'warning',
      })
      return
    }

    openFilePicker({ mode: 'publish', sessionId: session.id, kind })
  }

  const requestReplace = (document: TrainerDocument) => {
    openFilePicker({ mode: 'replace', documentId: document.id })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !fileIntent) {
      setFileIntent(null)
      return
    }

    if (
      file.type &&
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      pushToast({
        title: 'Fichier non accepté',
        description: 'Choisissez un PDF.',
        tone: 'warning',
      })
      setFileIntent(null)
      return
    }

    if (fileIntent.mode === 'publish') {
      const session = sessions.find((item) => item.id === fileIntent.sessionId)
      if (!session) {
        setFileIntent(null)
        return
      }
      const nextDoc = buildDocumentFromFile(session, fileIntent.kind, file)
      persist([nextDoc, ...documents])
      pushToast({
        title:
          fileIntent.kind === 'EXAM' ? 'Épreuve publiée' : 'Corrigé publié',
        description: `${nextDoc.fileName} — visible côté élèves.`,
        tone: 'success',
      })
    } else {
      const existing = documents.find((doc) => doc.id === fileIntent.documentId)
      if (!existing) {
        setFileIntent(null)
        return
      }
      const replaced: TrainerDocument = {
        ...existing,
        fileName: file.name.toLowerCase().endsWith('.pdf')
          ? file.name
          : `${file.name}.pdf`,
        fileSizeLabel: formatFileSizeLabel(file.size || 1),
        publishedAt: new Date().toISOString().slice(0, 10),
      }

      persist(
        documents.map((doc) => (doc.id === existing.id ? replaced : doc)),
      )
      pushToast({
        title: 'Fichier remplacé',
        description: replaced.fileName,
        tone: 'success',
      })
    }

    setFileIntent(null)
  }

  const handleDownload = (document: TrainerDocument) => {
    downloadDemoPdf(document.fileName, document.title)
    pushToast({
      title: 'Téléchargement lancé',
      description: document.fileName,
      tone: 'success',
    })
  }

  const confirmRemove = () => {
    if (!pendingRemove) return
    const removed = pendingRemove
    persist(documents.filter((doc) => doc.id !== removed.id))
    setPendingRemove(null)
    pushToast({
      title: 'Document retiré',
      description: removed.title,
      tone: 'info',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Documents
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Téléchargez le pack admin pour préparer, puis publiez l’épreuve aux
          élèves (corrigé après la séance).
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 font-sans">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FilePlus2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {missingTotal === 0
              ? 'Publications élèves à jour'
              : `${missingTotal} document${missingTotal > 1 ? 's' : ''} à publier aux élèves`}
          </p>
          <p className="text-sm text-base-content/90">
            {documents.length} fichier{documents.length > 1 ? 's' : ''} en ligne
            · pack admin = préparation · publication = élèves
          </p>
        </div>
      </div>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Vue
          </span>
          <FilterChip
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          >
            Toutes
          </FilterChip>
          <FilterChip
            active={filter === 'MISSING'}
            onClick={() =>
              setFilter((current) =>
                current === 'MISSING' ? 'ALL' : 'MISSING',
              )
            }
          >
            À compléter
          </FilterChip>
          <FilterChip
            active={filter === 'COMPLETE'}
            onClick={() =>
              setFilter((current) =>
                current === 'COMPLETE' ? 'ALL' : 'COMPLETE',
              )
            }
          >
            Complets
          </FilterChip>
        </div>
      </section>

      <section aria-labelledby="liste-docs-seances">
        <h2
          id="liste-docs-seances"
          className="font-display text-xl font-semibold"
        >
          Par séance ({rows.length})
        </h2>

        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucune séance avec ce filtre.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.session.id}>
                <SessionDocumentsCard
                  session={row.session}
                  exam={row.exam}
                  correction={row.correction}
                  adminPackIsNew={newPackIds.includes(row.session.id)}
                  onPublish={requestPublish}
                  onReplace={requestReplace}
                  onDownload={handleDownload}
                  onRemove={setPendingRemove}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Retirer ce document ?"
        message={
          pendingRemove
            ? `${pendingRemove.title} ne sera plus visible pour les élèves.`
            : ''
        }
        confirmLabel="Retirer"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  )
}

function SessionDocumentsCard({
  session,
  exam,
  correction,
  adminPackIsNew,
  onPublish,
  onReplace,
  onDownload,
  onRemove,
}: {
  session: TrainerSession
  exam?: TrainerDocument
  correction?: TrainerDocument
  adminPackIsNew: boolean
  onPublish: (session: TrainerSession, kind: TrainerDocumentKind) => void
  onReplace: (document: TrainerDocument) => void
  onDownload: (document: TrainerDocument) => void
  onRemove: (document: TrainerDocument) => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const priceLabel = formatTrainerSessionPrice(session)
  const correctionGate = canPublishCorrection(session, Boolean(exam))
  const adminPack = getTrainerAdminPack(session.id)

  return (
    <article className="rounded-xl border border-base-300 bg-white p-4 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-base-content">
            {session.chapter}
          </p>
          <p className="mt-0.5 text-sm text-base-content/90">
            {session.subject} · {session.groupLabel}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-base-content/80">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
            {formatSessionDate(session.date)} · {session.startTime}–
            {session.endTime}
          </p>
        </div>
        <TrainerSessionStatusBadge status={session.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1 text-sm text-primary"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          {detailsOpen ? 'Masquer les détails' : 'Plus de détails'}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-300 ease-out',
              detailsOpen ? 'rotate-180' : undefined,
            )}
            aria-hidden
          />
        </button>

        <Link
          to={`/formateur/seances/${session.id}`}
          className="link link-primary inline-flex min-h-9 items-center text-sm no-underline"
        >
          Voir la séance
        </Link>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          detailsOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <dl className="mt-3 flex flex-col gap-1.5 pb-0.5 text-sm text-base-content/90">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              <span>{session.room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {session.classLabel} · {session.seatsTaken}/{session.seatsTotal}{' '}
                places
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
              {session.pricing === 'FREE' ? (
                <span className="badge badge-ghost h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none">
                  {trainerPricingLabel('FREE')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span>Prix</span>
                  <span className="inline-flex items-center bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
                    {priceLabel ?? '—'}
                  </span>
                </span>
              )}
            </div>
          </dl>
        </div>
      </div>

      <AdminPrepPackBlock
        className="mt-4"
        pack={adminPack}
        downloadEnabled
        sessionId={session.id}
        isNew={adminPackIsNew}
      />

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-base-content">
          Publication élèves
        </p>
        <ul className="flex flex-col gap-2">
          <DocumentSlot
            kind="EXAM"
            document={exam}
            disabled={false}
            disabledHint={undefined}
            onPublish={() => onPublish(session, 'EXAM')}
            onReplace={onReplace}
            onDownload={onDownload}
            onRemove={onRemove}
          />
          <DocumentSlot
            kind="CORRECTION"
            document={correction}
            disabled={!correction && !correctionGate.ok}
            disabledHint={
              !correction && !correctionGate.ok
                ? correctionGate.message
                : undefined
            }
            onPublish={() => onPublish(session, 'CORRECTION')}
            onReplace={onReplace}
            onDownload={onDownload}
            onRemove={onRemove}
          />
        </ul>
      </div>
    </article>
  )
}

function DocumentSlot({
  kind,
  document,
  disabled,
  disabledHint,
  onPublish,
  onReplace,
  onDownload,
  onRemove,
}: {
  kind: TrainerDocumentKind
  document?: TrainerDocument
  disabled: boolean
  disabledHint?: string
  onPublish: () => void
  onReplace: (document: TrainerDocument) => void
  onDownload: (document: TrainerDocument) => void
  onRemove: (document: TrainerDocument) => void
}) {
  const isExam = kind === 'EXAM'
  const label = isExam ? 'Épreuve' : 'Corrigé'

  return (
    <li
      className={cn(
        'rounded-lg border px-3 py-2.5',
        document ? 'border-base-200' : 'border-dashed border-base-300',
        disabled ? 'opacity-80' : undefined,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            isExam
              ? 'bg-primary/10 text-primary'
              : 'bg-success/15 text-success',
          )}
        >
          {isExam ? (
            <BookOpen className="size-4" aria-hidden />
          ) : (
            <FileCheck2 className="size-4" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {document ? (
            <p className="text-xs text-base-content/80">
              {document.fileName} · publié le{' '}
              {formatShortDate(document.publishedAt)} · {document.fileSizeLabel}
            </p>
          ) : (
            <p className="text-xs text-base-content/70">
              {disabledHint ?? 'Pas encore publié'}
            </p>
          )}
        </div>

        {document ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-10 gap-1.5 border-2 border-base-content/35 text-base-content shadow-none"
              onClick={() => onDownload(document)}
            >
              <Download className="size-3.5" aria-hidden />
              PDF
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-10 gap-1.5 border-2 border-base-content/35 text-base-content shadow-none"
              onClick={() => onReplace(document)}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Remplacer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 gap-1.5 text-error"
              onClick={() => onRemove(document)}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Retirer
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            className={cn(
              'min-h-10 gap-1.5',
              !isExam &&
                'border-success bg-success text-success-content hover:border-success hover:bg-success/90',
            )}
            disabled={disabled}
            onClick={onPublish}
          >
            <Upload className="size-3.5" aria-hidden />
            Publier
          </Button>
        )}
      </div>
    </li>
  )
}

import {
  BookOpen,
  CalendarDays,
  Download,
  FileCheck2,
  FilePlus2,
  FileWarning,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react'
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AdminSessionStatusBadge } from '@/features/dashboards/school-admin/components/AdminSessionStatusBadge'
import { OfferKindBadge } from '@/features/dashboards/school-admin/components/OfferKindBadge'
import {
  countAdminMissingPackPlanningRows,
  listAdminPlanningRows,
  type AdminPlanningRow,
} from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import {
  getAdminSessionPack,
  saveAdminSessionPack,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import {
  adminPricingLabel,
  formatSessionDate,
} from '@/features/dashboards/school-admin/lib/format'
import { ADMIN_CLASSES } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import type { AdminSession } from '@/features/dashboards/school-admin/types'
import { downloadDemoPdf } from '@/features/dashboards/student/lib/download-demo-pdf'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { formatFileSizeLabel } from '@/features/dashboards/trainer/lib/trainer-documents-store'
import { getTrainerAdminPack } from '@/features/dashboards/trainer/mocks/trainer-admin-packs'
import type {
  TrainerAdminPack,
  TrainerAdminPackFile,
  TrainerDocumentKind,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type PackFilter = 'ALL' | 'MISSING' | 'COMPLETE'

const MANAGEABLE: AdminSession['status'][] = [
  'PENDING',
  'PUBLISHED',
  'POSTPONED',
]

type FileIntent = {
  sessionId: string
  kind: TrainerDocumentKind
}

type ClearIntent = {
  sessionId: string
  kind: TrainerDocumentKind
  label: string
}

function isPackFilter(value: string | null): value is PackFilter {
  return value === 'ALL' || value === 'MISSING' || value === 'COMPLETE'
}

function resolvePack(sessionId: string): TrainerAdminPack | undefined {
  return getAdminSessionPack(sessionId) ?? getTrainerAdminPack(sessionId)
}

function packMissingCount(session: AdminSession): number {
  const pack = resolvePack(session.id)
  const hasExam = Boolean(pack?.exam) || session.hasAdminExam
  const hasCorrection = Boolean(pack?.correction) || session.hasAdminCorrection
  return (hasExam ? 0 : 1) + (hasCorrection ? 0 : 1)
}

function buildDocumentsParams(next: {
  pack?: PackFilter
  classe?: string | null
}) {
  const params = new URLSearchParams()
  if (next.pack && next.pack !== 'ALL') params.set('pack', next.pack)
  if (next.classe) params.set('classe', next.classe)
  return params
}

/** Documents établissement — packs formateur + suivi publication élèves. */
export function SchoolAdminDocumentsPage() {
  const { pushToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [version, setVersion] = useState(0)
  const [fileIntent, setFileIntent] = useState<FileIntent | null>(null)
  const [pendingClear, setPendingClear] = useState<ClearIntent | null>(null)

  const initialPack = searchParams.get('pack')
  const classFromQuery = searchParams.get('classe')
  const [filter, setFilter] = useState<PackFilter>(
    isPackFilter(initialPack) ? initialPack : 'ALL',
  )
  const [classFilter, setClassFilter] = useState<string | null>(() => {
    if (
      classFromQuery &&
      (ADMIN_CLASSES as readonly string[]).includes(classFromQuery)
    ) {
      return classFromQuery
    }
    return null
  })

  const applyPackFilter = (next: PackFilter) => {
    setFilter(next)
    setSearchParams(
      buildDocumentsParams({ pack: next, classe: classFilter }),
      { replace: true },
    )
  }

  const applyClassFilter = (next: string | null) => {
    setClassFilter(next)
    setSearchParams(
      buildDocumentsParams({ pack: filter, classe: next }),
      { replace: true },
    )
  }

  const rows = useMemo(() => {
    void version
    return listAdminPlanningRows('ALL')
      .filter((row) => {
        const status = row.kind === 'session' ? row.session.status : row.status
        return MANAGEABLE.includes(status)
      })
      .map((row) => {
        const session =
          row.kind === 'session' ? row.session : row.representative
        return { row, session, missingCount: packMissingCount(session) }
      })
      .filter((item) => {
        if (classFilter && item.session.classLabel !== classFilter) return false
        if (filter === 'MISSING') return item.missingCount > 0
        if (filter === 'COMPLETE') return item.missingCount === 0
        return true
      })
      .sort((a, b) => {
        const byDate = a.session.date.localeCompare(b.session.date)
        if (byDate !== 0) return byDate
        return a.session.startTime.localeCompare(b.session.startTime)
      })
  }, [filter, classFilter, version])

  const missingSessions = useMemo(() => {
    void version
    return countAdminMissingPackPlanningRows()
  }, [version])

  const openPicker = (sessionId: string, kind: TrainerDocumentKind) => {
    setFileIntent({ sessionId, kind })
    window.setTimeout(() => fileInputRef.current?.click(), 0)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !fileIntent) {
      setFileIntent(null)
      return
    }
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      pushToast({
        title: 'PDF uniquement',
        description: 'Choisissez un fichier .pdf.',
        tone: 'warning',
      })
      setFileIntent(null)
      return
    }

    const existing = resolvePack(fileIntent.sessionId)
    const draft: TrainerAdminPackFile = {
      fileName: file.name,
      fileSizeLabel: formatFileSizeLabel(file.size || 1),
      pages: fileIntent.kind === 'EXAM' ? 4 : 3,
      providedAt: '2026-11-26',
    }
    const next: TrainerAdminPack = {
      exam: fileIntent.kind === 'EXAM' ? draft : existing?.exam,
      correction:
        fileIntent.kind === 'CORRECTION' ? draft : existing?.correction,
    }
    saveAdminSessionPack(fileIntent.sessionId, next)
    setVersion((v) => v + 1)
    pushToast({
      title: fileIntent.kind === 'EXAM' ? 'Épreuve jointe' : 'Corrigé joint',
      description:
        'Le formateur pourra télécharger après validation de la séance.',
      tone: 'success',
    })
    setFileIntent(null)
  }

  const confirmClear = () => {
    if (!pendingClear) return
    const existing = resolvePack(pendingClear.sessionId)
    const next: TrainerAdminPack = {
      exam: pendingClear.kind === 'EXAM' ? undefined : existing?.exam,
      correction:
        pendingClear.kind === 'CORRECTION' ? undefined : existing?.correction,
    }
    saveAdminSessionPack(pendingClear.sessionId, next)
    setVersion((v) => v + 1)
    pushToast({
      title:
        pendingClear.kind === 'EXAM' ? 'Épreuve retirée' : 'Corrigé retiré',
      description: pendingClear.label,
      tone: 'info',
    })
    setPendingClear(null)
  }

  const handleDownload = (file: TrainerAdminPackFile, label: string) => {
    downloadDemoPdf(file.fileName, label)
    pushToast({
      title: 'Téléchargement lancé',
      description: file.fileName,
      tone: 'success',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Documents
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Packs épreuve / corrigé pour les formateurs, et suivi des publications
          élèves.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 font-sans">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {missingSessions > 0 ? (
            <FileWarning className="size-4" aria-hidden />
          ) : (
            <FilePlus2 className="size-4" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {missingSessions === 0
              ? 'Tous les packs formateur sont complets'
              : `${missingSessions} séance${missingSessions > 1 ? 's' : ''} avec pack incomplet`}
          </p>
          <p className="text-sm text-base-content/90">
            Pack = préparation formateur · publication élèves = lecture seule
          </p>
        </div>
      </div>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Pack
          </span>
          <FilterChip
            active={filter === 'ALL'}
            onClick={() => applyPackFilter('ALL')}
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Tous
          </FilterChip>
          <FilterChip
            active={filter === 'MISSING'}
            onClick={() =>
              applyPackFilter(filter === 'MISSING' ? 'ALL' : 'MISSING')
            }
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Incomplets
          </FilterChip>
          <FilterChip
            active={filter === 'COMPLETE'}
            onClick={() =>
              applyPackFilter(filter === 'COMPLETE' ? 'ALL' : 'COMPLETE')
            }
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Complets
          </FilterChip>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-base-200 pt-2">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Classe
          </span>
          <FilterChip
            active={classFilter === null}
            onClick={() => applyClassFilter(null)}
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Toutes
          </FilterChip>
          {ADMIN_CLASSES.map((label) => (
            <FilterChip
              key={label}
              active={classFilter === label}
              onClick={() =>
                applyClassFilter(classFilter === label ? null : label)
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="liste-docs-admin">
        <h2
          id="liste-docs-admin"
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
            {rows.map(({ row, session }) => (
              <li key={row.id}>
                <SessionPackCard
                  row={row}
                  session={session}
                  onPick={openPicker}
                  onDownload={handleDownload}
                  onRequestClear={(kind, label) =>
                    setPendingClear({
                      sessionId: session.id,
                      kind,
                      label,
                    })
                  }
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
        open={pendingClear !== null}
        title="Retirer ce fichier ?"
        message={
          pendingClear
            ? `${pendingClear.label} ne sera plus joint au pack formateur.`
            : ''
        }
        confirmLabel="Retirer"
        onConfirm={confirmClear}
        onCancel={() => setPendingClear(null)}
      />
    </div>
  )
}

function SessionPackCard({
  row,
  session,
  onPick,
  onDownload,
  onRequestClear,
}: {
  row: AdminPlanningRow
  session: AdminSession
  onPick: (sessionId: string, kind: TrainerDocumentKind) => void
  onDownload: (file: TrainerAdminPackFile, label: string) => void
  onRequestClear: (kind: TrainerDocumentKind, label: string) => void
}) {
  const pack = resolvePack(session.id)
  const examFile = pack?.exam
  const correctionFile = pack?.correction
  const hasExam = Boolean(examFile) || session.hasAdminExam
  const hasCorrection = Boolean(correctionFile) || session.hasAdminCorrection
  const packIncomplete = !hasExam || !hasCorrection
  const canEdit =
    session.status === 'PENDING' ||
    session.status === 'PUBLISHED' ||
    session.status === 'POSTPONED'
  const isPublic = row.kind === 'publicOffer'
  const status = row.kind === 'session' ? row.session.status : row.status
  const trainerLabel = isPublic
    ? status === 'PUBLISHED' && row.winnerName
      ? row.winnerName
      : `${row.trainerNames.length} formateur${row.trainerNames.length > 1 ? 's' : ''}`
    : session.trainerName

  return (
    <article className="rounded-xl border border-base-300 bg-white p-4 font-sans">
      <div className="flex items-center justify-between gap-3">
        <OfferKindBadge kind={isPublic ? 'public' : 'direct'} />
        <AdminSessionStatusBadge status={status} />
      </div>

      <p className="mt-2 font-display text-lg font-semibold text-base-content">
        {session.chapter}
      </p>
      <p className="mt-0.5 text-sm text-base-content/90">
        {session.subject} · {session.classLabel} · {session.groupLabel}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/80">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />
          {formatSessionDate(session.date)} · {session.startTime}–
          {session.endTime}
        </span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-3 text-sm text-base-content/80">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{trainerLabel}</span>
        </span>
        <span
          className={
            session.pricing === 'FREE'
              ? 'badge badge-ghost h-auto min-h-0 shrink-0 border-0 px-2.5 py-1 text-xs font-medium'
              : 'inline-flex shrink-0 items-center bg-success px-2.5 py-1 text-xs font-semibold text-success-content'
          }
        >
          {adminPricingLabel(session.pricing)}
        </span>
      </p>

      {packIncomplete ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-medium"
        >
          Pack incomplet — joignez l’épreuve et/ou le corrigé.
        </p>
      ) : null}

      <ul className="mt-3 flex flex-col gap-2">
        <PackFileRow
          label="Épreuve (pack formateur)"
          file={examFile}
          markedJoined={hasExam && !examFile}
          canEdit={canEdit}
          onPick={() => onPick(session.id, 'EXAM')}
          onDownload={() =>
            examFile && onDownload(examFile, `Épreuve — ${session.chapter}`)
          }
          onClear={() => onRequestClear('EXAM', `Épreuve — ${session.chapter}`)}
        />
        <PackFileRow
          label="Corrigé (pack formateur)"
          file={correctionFile}
          markedJoined={hasCorrection && !correctionFile}
          canEdit={canEdit}
          onPick={() => onPick(session.id, 'CORRECTION')}
          onDownload={() =>
            correctionFile &&
            onDownload(correctionFile, `Corrigé — ${session.chapter}`)
          }
          onClear={() =>
            onRequestClear('CORRECTION', `Corrigé — ${session.chapter}`)
          }
        />
      </ul>

      <div className="mt-4 border-t border-base-200 pt-3">
        <p className="text-xs font-medium text-base-content/70">
          Publication élèves
          <span className="font-normal"> · gérée par le formateur</span>
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-base-content/80">
              <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
              Épreuve élèves
            </span>
            {session.studentExamPublished ? (
              <span className="font-medium text-success">Publiée</span>
            ) : (
              <span className="text-base-content/70">Pas encore</span>
            )}
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-base-content/80">
              <FileCheck2
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              Corrigé élèves
            </span>
            {session.studentCorrectionPublished ? (
              <span className="font-medium text-success">Publié</span>
            ) : (
              <span className="text-base-content/70">Pas encore</span>
            )}
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <Link to={`/admin-etablissement/planning/${session.id}`}>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full gap-2 border-2 border-base-content/35"
          >
            Voir la séance
          </Button>
        </Link>
      </div>
    </article>
  )
}

function PackFileRow({
  label,
  file,
  markedJoined,
  canEdit,
  onPick,
  onDownload,
  onClear,
}: {
  label: string
  file?: TrainerAdminPackFile
  markedJoined?: boolean
  canEdit: boolean
  onPick: () => void
  onDownload: () => void
  onClear: () => void
}) {
  const joined = Boolean(file) || Boolean(markedJoined)
  return (
    <li
      className={cn(
        'border px-3 py-2.5',
        joined
          ? 'border-base-200'
          : 'border-dashed border-base-300 bg-base-200/20',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <FileCheck2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {file ? (
            <p className="truncate text-xs text-base-content/80">
              {file.fileName} · {file.fileSizeLabel}
            </p>
          ) : markedJoined ? (
            <p className="text-xs font-medium text-success">Jointe</p>
          ) : (
            <p className="text-xs text-base-content/70">
              Aucun fichier — à joindre
            </p>
          )}
        </div>
        {canEdit ? (
          file ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-10 w-10 border-2 border-base-content/35 px-0 sm:w-auto sm:gap-1.5 sm:px-3"
                onClick={onDownload}
                aria-label="Télécharger"
              >
                <Download className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Télécharger</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-10 w-10 border-2 border-base-content/35 px-0 sm:w-auto sm:gap-1.5 sm:px-3"
                onClick={onPick}
                aria-label="Remplacer"
              >
                <Upload className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Remplacer</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-10 w-10 px-0 text-error sm:w-auto sm:gap-1.5 sm:px-3"
                onClick={onClear}
                aria-label="Retirer"
              >
                <Trash2 className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Retirer</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              className="min-h-10 shrink-0 gap-1.5"
              onClick={onPick}
            >
              <Upload className="size-3.5" aria-hidden />
              {markedJoined ? 'Remplacer' : 'Choisir PDF'}
            </Button>
          )
        ) : file ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-10 w-10 shrink-0 border-2 border-base-content/35 px-0 sm:w-auto sm:gap-1.5 sm:px-3"
            onClick={onDownload}
            aria-label="Télécharger"
          >
            <Download className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Télécharger</span>
          </Button>
        ) : null}
      </div>
    </li>
  )
}

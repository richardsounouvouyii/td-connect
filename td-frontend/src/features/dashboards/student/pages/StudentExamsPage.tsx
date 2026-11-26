import {
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  EyeOff,
  FileText,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { downloadDemoPdf } from '@/features/dashboards/student/lib/download-demo-pdf'
import { formatShortDate } from '@/features/dashboards/student/lib/format'
import {
  listStudentDocumentPacks,
  type StudentDocumentPack,
} from '@/features/dashboards/student/mocks/student-documents'
import type { StudentDocument } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

type KindFilter = 'ALL' | StudentDocument['kind']
type SeenFilter = 'ALL' | 'NEW' | 'SEEN'

/** Catalogue épreuves / corrigés publiés par les formateurs. */
export function StudentExamsPage() {
  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL')
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const [seenFilter, setSeenFilter] = useState<SeenFilter>('ALL')

  const packs = useMemo(() => listStudentDocumentPacks(), [])

  const subjects = useMemo(
    () =>
      [...new Set(packs.map((pack) => pack.subject))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [packs],
  )

  const filteredPacks = useMemo(() => {
    return packs
      .filter((pack) => {
        if (kindFilter === 'EXAM' && !pack.exam) return false
        if (kindFilter === 'CORRECTION' && !pack.correction) return false
        if (subjectFilter && pack.subject !== subjectFilter) return false
        if (seenFilter === 'NEW' && pack.seen) return false
        if (seenFilter === 'SEEN' && !pack.seen) return false
        return true
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [packs, kindFilter, subjectFilter, seenFilter])

  const hasActiveFilters =
    kindFilter !== 'ALL' || subjectFilter !== null || seenFilter !== 'ALL'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Épreuves
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          L’épreuve est téléchargeable dès publication. Le corrigé s’active
          seulement quand le formateur l’a publié après la séance.
        </p>
      </header>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
              Type
            </span>
            <FilterChip
              active={kindFilter === 'ALL'}
              onClick={() => setKindFilter('ALL')}
            >
              Tous
            </FilterChip>
            <FilterChip
              active={kindFilter === 'EXAM'}
              onClick={() =>
                setKindFilter((current) =>
                  current === 'EXAM' ? 'ALL' : 'EXAM',
                )
              }
            >
              Épreuves
            </FilterChip>
            <FilterChip
              active={kindFilter === 'CORRECTION'}
              onClick={() =>
                setKindFilter((current) =>
                  current === 'CORRECTION' ? 'ALL' : 'CORRECTION',
                )
              }
            >
              Corrigés
            </FilterChip>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
              Matière
            </span>
            <FilterChip
              active={subjectFilter === null}
              onClick={() => setSubjectFilter(null)}
            >
              Toutes
            </FilterChip>
            {subjects.map((subject) => (
              <FilterChip
                key={subject}
                active={subjectFilter === subject}
                onClick={() =>
                  setSubjectFilter((current) =>
                    current === subject ? null : subject,
                  )
                }
              >
                {subject}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
              État
            </span>
            <FilterChip
              active={seenFilter === 'ALL'}
              onClick={() => setSeenFilter('ALL')}
            >
              Tous
            </FilterChip>
            <FilterChip
              active={seenFilter === 'NEW'}
              onClick={() =>
                setSeenFilter((current) =>
                  current === 'NEW' ? 'ALL' : 'NEW',
                )
              }
            >
              Nouveaux
            </FilterChip>
            <FilterChip
              active={seenFilter === 'SEEN'}
              onClick={() =>
                setSeenFilter((current) =>
                  current === 'SEEN' ? 'ALL' : 'SEEN',
                )
              }
            >
              Déjà vus
            </FilterChip>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="link link-primary self-start text-xs no-underline"
              onClick={() => {
                setKindFilter('ALL')
                setSubjectFilter(null)
                setSeenFilter('ALL')
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="liste-documents">
        <h2 id="liste-documents" className="font-display text-xl font-semibold">
          Documents ({filteredPacks.length})
        </h2>

        {filteredPacks.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucun document avec ces filtres.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {filteredPacks.map((pack) => (
              <li key={pack.id}>
                <DocumentPackCard pack={pack} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DocumentPackCard({ pack }: { pack: StudentDocumentPack }) {
  const { pushToast } = useToast()
  const examReady = Boolean(pack.exam?.downloadable)
  const correctionReady = Boolean(pack.correction?.downloadable)
  const isNew = !pack.seen
  const referenceDoc = pack.exam ?? pack.correction

  const handleDownload = (
    target: StudentDocument | undefined,
    label: string,
  ) => {
    if (!target?.downloadable) {
      pushToast({
        title: `${label} indisponible`,
        description:
          label === 'Corrigé PDF'
            ? 'Le corrigé sera disponible après la séance, quand le formateur l’aura publié.'
            : 'Le formateur n’a pas encore publié ce fichier.',
        tone: 'warning',
      })
      return
    }

    downloadDemoPdf(target.fileName, target.title)
    pushToast({
      title: 'Téléchargement lancé',
      description: target.fileName,
      tone: 'success',
    })
  }

  const statusLabel = (() => {
    if (examReady && correctionReady) return 'Épreuve + corrigé'
    if (examReady) return 'Épreuve seule · corrigé bientôt'
    if (correctionReady) return 'Corrigé publié'
    return 'Aucun fichier'
  })()

  return (
    <article className="rounded-xl border border-base-300 bg-white p-4 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-base-content">
              {pack.chapter}
            </p>
            <p className="mt-0.5 text-sm text-base-content/90">
              {pack.subject} · {statusLabel}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
            isNew ? 'badge-info' : 'badge-ghost',
          )}
        >
          {isNew ? (
            <span className="inline-flex items-center gap-1">
              <EyeOff className="size-3" aria-hidden />
              Nouveau
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" aria-hidden />
              Déjà vu
            </span>
          )}
        </span>
      </div>

      <dl className="mt-3 flex flex-col gap-1.5 text-sm text-base-content/90">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{pack.trainerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {examReady && pack.exam
              ? `Épreuve le ${formatShortDate(pack.exam.publishedAt)}`
              : 'Épreuve non publiée'}
            {correctionReady && pack.correction
              ? ` · Corrigé le ${formatShortDate(pack.correction.publishedAt)}`
              : ' · Corrigé pas encore publié'}
          </span>
        </div>
        {referenceDoc ? (
          <div className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-primary" aria-hidden />
            <span>
              {examReady && pack.exam
                ? `${pack.exam.fileName} · ${pack.exam.pages} p. · ${pack.exam.fileSizeLabel}`
                : correctionReady && pack.correction
                  ? `${pack.correction.fileName} · ${pack.correction.pages} p. · ${pack.correction.fileSizeLabel}`
                  : null}
            </span>
          </div>
        ) : null}
      </dl>

      {pack.linkedSessionId ? (
        <Link
          to={`/eleve/planning/${pack.linkedSessionId}`}
          className="link link-primary mt-2 inline-flex min-h-9 items-center text-sm no-underline"
        >
          Voir la séance liée
        </Link>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 border-t border-base-200 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            size="sm"
            className="min-h-11 gap-2"
            disabled={!examReady}
            title={
              examReady
                ? 'Télécharger l’épreuve'
                : 'Épreuve pas encore publiée'
            }
            onClick={() => handleDownload(pack.exam, 'Épreuve PDF')}
          >
            <Download className="size-4" aria-hidden />
            Épreuve PDF
          </Button>

          <Button
            type="button"
            size="sm"
            className={cn(
              'min-h-11 gap-2',
              correctionReady
                ? 'border-success bg-success text-success-content hover:border-success hover:bg-success/90'
                : 'border-2 border-base-300 bg-base-200 text-base-content/50',
            )}
            disabled={!correctionReady}
            title={
              correctionReady
                ? 'Télécharger le corrigé'
                : 'Corrigé pas encore publié'
            }
            onClick={() => handleDownload(pack.correction, 'Corrigé PDF')}
          >
            <Download className="size-4" aria-hidden />
            Corrigé PDF
          </Button>
        </div>
        {!correctionReady ? (
          <p className="text-xs text-base-content/70">
            Corrigé indisponible pour l’instant — publié après la séance.
          </p>
        ) : null}
      </div>
    </article>
  )
}

import {
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
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
  getLinkedDocument,
  STUDENT_DOCUMENTS,
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

  const subjects = useMemo(
    () =>
      [...new Set(STUDENT_DOCUMENTS.map((doc) => doc.subject))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [],
  )

  const documents = useMemo(() => {
    return STUDENT_DOCUMENTS.filter((doc) => {
      if (kindFilter !== 'ALL' && doc.kind !== kindFilter) return false
      if (subjectFilter && doc.subject !== subjectFilter) return false
      if (seenFilter === 'NEW' && doc.seen) return false
      if (seenFilter === 'SEEN' && !doc.seen) return false
      return true
    }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [kindFilter, subjectFilter, seenFilter])

  const hasActiveFilters =
    kindFilter !== 'ALL' || subjectFilter !== null || seenFilter !== 'ALL'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Épreuves
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Épreuves et corrigés publiés par vos formateurs — téléchargeables en
          PDF.
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
          Documents ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucun document avec ces filtres.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <DocumentCard document={doc} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DocumentCard({ document }: { document: StudentDocument }) {
  const { pushToast } = useToast()
  const isExam = document.kind === 'EXAM'
  const isNew = !document.seen
  const examDoc = getLinkedDocument(document, 'EXAM')
  const correctionDoc = getLinkedDocument(document, 'CORRECTION')

  const handleDownload = (
    target: StudentDocument | undefined,
    label: string,
  ) => {
    if (!target?.downloadable) {
      pushToast({
        title: `${label} indisponible`,
        description: 'Le formateur n’a pas encore publié ce fichier.',
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

  return (
    <article className="rounded-xl border border-base-300 bg-white p-4 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
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
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-base-content">
              {document.title}
            </p>
            <p className="mt-0.5 text-sm text-base-content/90">
              {isExam ? 'Épreuve' : 'Corrigé'} · {document.subject}
            </p>
            <p className="mt-0.5 text-sm text-base-content/80">
              {document.chapter}
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
          <span>{document.trainerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
          <span>Publié le {formatShortDate(document.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {document.fileName} · {document.pages} page
            {document.pages > 1 ? 's' : ''} · {document.fileSizeLabel}
          </span>
        </div>
      </dl>

      {document.linkedSessionId ? (
        <Link
          to={`/eleve/planning/${document.linkedSessionId}`}
          className="link link-primary mt-2 inline-flex min-h-9 items-center text-sm no-underline"
        >
          Voir la séance liée
        </Link>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-base-200 pt-3">
        <Button
          type="button"
          size="sm"
          className="min-h-11 gap-2"
          disabled={!examDoc?.downloadable}
          onClick={() => handleDownload(examDoc, 'Épreuve PDF')}
        >
          <Download className="size-4" aria-hidden />
          Épreuve PDF
        </Button>

        <Button
          type="button"
          size="sm"
          className="min-h-11 gap-2 border-success bg-success text-success-content hover:border-success hover:bg-success/90"
          disabled={!correctionDoc?.downloadable}
          onClick={() => handleDownload(correctionDoc, 'Corrigé PDF')}
        >
          <Download className="size-4" aria-hidden />
          Corrigé PDF
        </Button>
      </div>
    </article>
  )
}

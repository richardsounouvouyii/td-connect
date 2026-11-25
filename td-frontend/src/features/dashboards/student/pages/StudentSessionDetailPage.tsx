import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  MapPin,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { SessionParticipateButton } from '@/features/dashboards/student/components/SessionParticipateButton'
import {
  SessionPricingLabel,
} from '@/features/dashboards/student/components/SessionPricingRow'
import { SessionStatusBadge } from '@/features/dashboards/student/components/SessionStatusBadge'
import { downloadDemoPdf } from '@/features/dashboards/student/lib/download-demo-pdf'
import {
  formatSessionDate,
  formatSessionPrice,
} from '@/features/dashboards/student/lib/format'
import { canJoinSession } from '@/features/dashboards/student/lib/participation'
import { STUDENT_DOCUMENTS } from '@/features/dashboards/student/mocks/student-documents'
import { getStudentSessionById } from '@/features/dashboards/student/mocks/student-sessions'
import type { StudentDocument } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

/** Détail d’une séance TD (élève). */
export function StudentSessionDetailPage() {
  const { pushToast } = useToast()
  const { sessionId } = useParams()
  const session = sessionId ? getStudentSessionById(sessionId) : undefined

  if (!session) {
    return <Navigate to="/eleve/planning" replace />
  }

  const linkedDocs = STUDENT_DOCUMENTS.filter(
    (doc) => doc.linkedSessionId === session.id,
  )
  const priceLabel = formatSessionPrice(session)
  const joinable = canJoinSession(session)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Link to="/eleve/planning" className="inline-flex w-fit">
        <Button variant="ghost" className="min-h-11 gap-2 px-2">
          <ArrowLeft className="size-4" aria-hidden />
          Retour au planning
        </Button>
      </Link>

      <header className="rounded-xl border border-base-300 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Séance TD
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {session.subject}
            </h1>
            <p className="mt-1 text-base text-base-content/90">
              {session.chapter}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SessionStatusBadge status={session.status} />
            <SessionPricingLabel pricing={session.pricing} />
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={CalendarDays}
            label="Date"
            value={formatSessionDate(session.date)}
          />
          <DetailItem
            icon={Clock3}
            label="Horaire"
            value={`${session.startTime} – ${session.endTime}`}
          />
          <DetailItem icon={MapPin} label="Salle" value={session.room} />
          <DetailItem
            icon={UserRound}
            label="Formateur"
            value={session.trainerName}
          />
          <DetailItem icon={Users} label="Groupe" value={session.groupLabel} />
          <DetailItem
            icon={Building2}
            label="Établissement"
            value={session.establishmentName}
          />
        </dl>

        {session.pricing === 'PAID' && priceLabel ? (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm text-base-content/90">
              <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
              <span>
                Prix{' '}
                <span className="inline-flex items-center rounded-md bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
                  {priceLabel}
                </span>
              </span>
            </div>
            <SessionPricingLabel pricing="PAID" />
          </div>
        ) : null}
      </header>

      {joinable ? (
        <section className="rounded-xl border border-primary/25 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold">Inscription</h2>
              <p className="mt-1 text-sm text-base-content/90">
                {session.pricing === 'PAID'
                  ? 'Séance payante — inscription démo, sans paiement réel.'
                  : 'Séance gratuite — confirmez votre place.'}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-base-200 pt-4">
            <SessionParticipateButton session={session} />
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-base-300 bg-white px-4 py-3 text-sm text-base-content/90">
          Les inscriptions ne sont plus ouvertes pour cette séance.
        </p>
      )}

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Documents liés</h2>
          <Link
            to="/eleve/epreuves"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Catalogue
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {linkedDocs.length === 0 ? (
          <p className="mt-3 rounded-xl border border-base-300 bg-white px-4 py-6 text-center text-base-content/90">
            Aucun document publié pour cette séance pour le moment.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {linkedDocs.map((doc) => (
              <li key={doc.id}>
                <LinkedDocumentRow
                  document={doc}
                  onDownload={() => {
                    downloadDemoPdf(doc.fileName, doc.title)
                    pushToast({
                      title: 'Téléchargement lancé',
                      description: doc.fileName,
                      tone: 'success',
                    })
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div>
        <dt className="text-sm text-base-content/80">{label}</dt>
        <dd className="text-base font-medium text-base-content">{value}</dd>
      </div>
    </div>
  )
}

function LinkedDocumentRow({
  document,
  onDownload,
}: {
  document: StudentDocument
  onDownload: () => void
}) {
  const isExam = document.kind === 'EXAM'

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-white px-4 py-3">
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          isExam ? 'bg-primary/10 text-primary' : 'bg-success/15 text-success',
        )}
      >
        {isExam ? (
          <BookOpen className="size-4" aria-hidden />
        ) : (
          <FileCheck2 className="size-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{document.title}</p>
        <p className="text-sm text-base-content/90">
          {isExam ? 'Épreuve' : 'Corrigé'} · {document.pages} p. ·{' '}
          {document.fileSizeLabel}
          {!document.seen ? ' · Nouveau' : ''}
        </p>
      </div>
      {document.downloadable ? (
        <Button
          type="button"
          size="sm"
          className="min-h-11 gap-2"
          onClick={onDownload}
        >
          <Download className="size-4" aria-hidden />
          PDF
        </Button>
      ) : null}
    </div>
  )
}

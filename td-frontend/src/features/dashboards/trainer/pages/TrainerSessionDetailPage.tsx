import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  MapPin,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TrainerSessionStatusBadge } from '@/features/dashboards/trainer/components/TrainerSessionStatusBadge'
import {
  formatSessionDate,
  formatTrainerSessionPrice,
  trainerPricingLabel,
} from '@/features/dashboards/trainer/lib/format'
import {
  acceptTrainerSession,
  canRefuseValidatedSession,
  REFUSE_MIN_DAYS_BEFORE,
  refuseTrainerSession,
} from '@/features/dashboards/trainer/lib/session-decisions'
import { getTrainerSessionById } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import { cn } from '@/lib/cn'

/** Détail d’une séance / proposition côté formateur. */
export function TrainerSessionDetailPage() {
  const { pushToast } = useToast()
  const { sessionId } = useParams()
  const [version, setVersion] = useState(0)
  const [confirmAccept, setConfirmAccept] = useState(false)
  const [refuseOpen, setRefuseOpen] = useState(false)
  const [refuseReason, setRefuseReason] = useState('')

  const session = useMemo(
    () => (sessionId ? getTrainerSessionById(sessionId) : undefined),
    [sessionId, version],
  )

  if (!session) {
    return <Navigate to="/formateur/seances" replace />
  }

  const priceLabel = formatTrainerSessionPrice(session)
  const isPending = session.status === 'PENDING'
  const showEnrollment =
    session.status === 'PUBLISHED' || session.status === 'POSTPONED'
  const noStudents = showEnrollment && session.seatsTaken === 0
  const canRefuseValidated = canRefuseValidatedSession(session)

  const handleAccept = () => {
    acceptTrainerSession(session.id)
    setConfirmAccept(false)
    setVersion((v) => v + 1)
    pushToast({
      title: 'Séance validée',
      description: 'Badge Validée — les élèves peuvent s’inscrire.',
      tone: 'success',
    })
  }

  const handleRefuse = () => {
    refuseTrainerSession(session.id, refuseReason)
    setRefuseOpen(false)
    setRefuseReason('')
    setVersion((v) => v + 1)
    pushToast({
      title: 'Proposition refusée',
      description: 'L’administration est informée (démo).',
      tone: 'info',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="sticky top-[3.75rem] z-20 -mx-4 -mt-5 border-b border-base-300/70 bg-base-100/95 px-4 py-1.5 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link to="/formateur/seances" className="inline-flex w-fit">
          <Button variant="ghost" className="min-h-10 gap-2 px-2">
            <ArrowLeft className="size-4" aria-hidden />
            Retour aux séances
          </Button>
        </Link>
      </div>

      <header className="rounded-xl border border-base-300 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              {isPending ? 'Proposition admin' : 'Séance TD'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {session.subject}
            </h1>
            <p className="mt-1 text-base text-base-content/90">
              {session.chapter}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TrainerSessionStatusBadge status={session.status} />
            <span
              className={cn(
                'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
                session.pricing === 'PAID' ? 'badge-success' : 'badge-ghost',
              )}
            >
              {trainerPricingLabel(session.pricing)}
            </span>
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
            icon={Users}
            label="Classe / groupe"
            value={`${session.classLabel} · ${session.groupLabel}`}
          />
          <DetailItem
            icon={Building2}
            label="Établissement"
            value={session.establishmentName}
          />
          <DetailItem
            icon={Users}
            label="Places"
            value={
              isPending
                ? `${session.seatsTotal} prévues`
                : `${session.seatsTaken} / ${session.seatsTotal}`
            }
          />
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-base-content/90">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            <span>
              Prix{' '}
              <span className="inline-flex items-center rounded-md bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
                {session.pricing === 'FREE'
                  ? 'Gratuit'
                  : (priceLabel ?? '—')}
              </span>
            </span>
          </div>
          <span
            className={cn(
              'badge h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
              session.pricing === 'PAID' ? 'badge-success' : 'badge-ghost',
            )}
          >
            {trainerPricingLabel(session.pricing)}
          </span>
        </div>

        {session.proposalNote && isPending ? (
          <p className="mt-4 rounded-lg bg-primary/5 px-3 py-2 text-sm text-base-content/90">
            {session.proposalNote}
          </p>
        ) : null}

        {session.statusNote ? (
          <p className="mt-4 rounded-lg bg-base-200/70 px-3 py-2 text-sm text-base-content/90">
            {session.statusNote}
          </p>
        ) : null}

        {session.objectives ? (
          <div className="mt-4 border-t border-base-200 pt-4">
            <h2 className="font-display text-lg font-semibold">Objectifs</h2>
            <p className="mt-1 text-base text-base-content/90">
              {session.objectives}
            </p>
          </div>
        ) : null}
      </header>

      {isPending ? (
        <section className="rounded-xl border border-warning/30 bg-warning/5 p-4 font-sans sm:p-5">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Valider cette séance
          </h2>
          <p className="mt-1 text-sm text-base-content/90">
            Vérifiez le prix et le créneau. Si vous validez, la séance passe en
            « Validée » et devient visible pour les élèves.
          </p>

          {refuseOpen ? (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-base-content/70">
                  Motif (optionnel)
                </span>
                <textarea
                  className="textarea textarea-bordered mt-1 w-full text-sm"
                  rows={3}
                  value={refuseReason}
                  onChange={(event) => setRefuseReason(event.target.value)}
                  placeholder="Ex. : indisponible ce créneau, prix trop bas…"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="min-h-11 gap-2 border-error bg-error text-error-content hover:border-error hover:bg-error/90"
                  onClick={handleRefuse}
                >
                  <X className="size-4" aria-hidden />
                  Confirmer le refus
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    setRefuseOpen(false)
                    setRefuseReason('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-11 gap-2"
                onClick={() => setConfirmAccept(true)}
              >
                <Check className="size-4" aria-hidden />
                Valider
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 gap-2 border-error text-error hover:bg-error/10"
                onClick={() => setRefuseOpen(true)}
              >
                <X className="size-4" aria-hidden />
                Refuser
              </Button>
            </div>
          )}
        </section>
      ) : null}

      {showEnrollment ? (
        <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Inscriptions élèves
          </h2>
          <p className="mt-1 text-sm text-base-content/90">
            {session.seatsTaken} inscrit
            {session.seatsTaken > 1 ? 's' : ''} sur {session.seatsTotal} places
          </p>
          {noStudents ? (
            <p className="mt-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-base-content/90">
              Aucune inscription pour l’instant. La séance reste publiée — une
              alerte ou une annulation pourra suivre si ça reste vide près de
              la date.
            </p>
          ) : null}

          {canRefuseValidated ? (
            <div className="mt-4 border-t border-base-200 pt-4">
              <p className="text-sm text-base-content/90">
                Vous pouvez encore refuser jusqu’à {REFUSE_MIN_DAYS_BEFORE}{' '}
                jours avant la séance.
              </p>
              {refuseOpen ? (
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-base-content/70">
                      Motif (optionnel)
                    </span>
                    <textarea
                      className="textarea textarea-bordered mt-1 w-full text-sm"
                      rows={3}
                      value={refuseReason}
                      onChange={(event) => setRefuseReason(event.target.value)}
                      placeholder="Ex. : imprévu, conflit d’emploi du temps…"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="min-h-11 gap-2 border-error bg-error text-error-content hover:border-error hover:bg-error/90"
                      onClick={handleRefuse}
                    >
                      <X className="size-4" aria-hidden />
                      Confirmer le refus
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11"
                      onClick={() => {
                        setRefuseOpen(false)
                        setRefuseReason('')
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 min-h-11 gap-2 border-error text-error hover:bg-error/10"
                  onClick={() => setRefuseOpen(true)}
                >
                  <X className="size-4" aria-hidden />
                  Refuser la séance
                </Button>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {!isPending ? (
        <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Documents liés
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            <li className="flex items-center gap-3 rounded-lg border border-base-200 px-3 py-2.5">
              <BookOpen className="size-4 text-primary" aria-hidden />
              <span className="flex-1 text-sm">
                Épreuve{' '}
                {session.hasExam ? (
                  <span className="text-success">publiée</span>
                ) : (
                  <span className="text-base-content/70">pas encore</span>
                )}
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-lg border border-base-200 px-3 py-2.5">
              <FileCheck2 className="size-4 text-success" aria-hidden />
              <span className="flex-1 text-sm">
                Corrigé{' '}
                {session.hasCorrection ? (
                  <span className="text-success">publié</span>
                ) : (
                  <span className="text-base-content/70">pas encore</span>
                )}
              </span>
            </li>
          </ul>
          <Link
            to="/formateur/documents"
            className="link link-primary mt-3 inline-flex min-h-11 items-center text-sm no-underline"
          >
            Gérer les documents
          </Link>
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmAccept}
        title="Valider cette séance ?"
        message={
          session.pricing === 'FREE'
            ? 'Elle sera marquée Validée et visible gratuitement pour les élèves.'
            : `Prix proposé : ${priceLabel ?? '—'}. Elle sera marquée Validée et visible pour les élèves.`
        }
        confirmLabel="Valider"
        cancelLabel="Annuler"
        onConfirm={handleAccept}
        onCancel={() => setConfirmAccept(false)}
      />

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
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-base-content/70 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-base text-base-content">{value}</dd>
      </div>
    </div>
  )
}

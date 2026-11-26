import {
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useMemo, useState, type MouseEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { TrainerSessionStatusBadge } from '@/features/dashboards/trainer/components/TrainerSessionStatusBadge'
import {
  formatSessionDate,
  formatTrainerSessionPrice,
  trainerPricingLabel,
} from '@/features/dashboards/trainer/lib/format'
import {
  acceptTrainerSession,
  canRefuseValidatedSession,
  canValidateFromList,
  REFUSE_MIN_DAYS_BEFORE,
  refuseTrainerSession,
} from '@/features/dashboards/trainer/lib/session-decisions'
import { listTrainerSessions } from '@/features/dashboards/trainer/mocks/trainer-sessions'
import type {
  TrainerSession,
  TrainerSessionStatus,
} from '@/features/dashboards/trainer/types'

type StatusFilter = 'ALL' | TrainerSessionStatus

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PENDING', label: 'À valider' },
  { id: 'PUBLISHED', label: 'Validées' },
  { id: 'POSTPONED', label: 'Reportées' },
  { id: 'REJECTED', label: 'Refusées' },
  { id: 'CANCELLED', label: 'Annulées' },
  { id: 'COMPLETED', label: 'Terminées' },
]

function isStatusFilter(value: string | null): value is StatusFilter {
  return (
    value === 'ALL' ||
    value === 'PENDING' ||
    value === 'PUBLISHED' ||
    value === 'POSTPONED' ||
    value === 'REJECTED' ||
    value === 'CANCELLED' ||
    value === 'COMPLETED'
  )
}

/** Liste des séances du formateur avec filtres de statut. */
export function TrainerSessionsPage() {
  const { pushToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = searchParams.get('statut')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    isStatusFilter(initial) ? initial : 'ALL',
  )
  const [version, setVersion] = useState(0)
  const [pendingValidate, setPendingValidate] =
    useState<TrainerSession | null>(null)
  const [pendingRefuse, setPendingRefuse] = useState<TrainerSession | null>(
    null,
  )

  const sessions = useMemo(() => {
    return listTrainerSessions()
      .filter((session) => {
        if (statusFilter !== 'ALL' && session.status !== statusFilter)
          return false
        return true
      })
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date)
        if (byDate !== 0) return byDate
        return b.startTime.localeCompare(a.startTime)
      })
  }, [statusFilter, version])

  const applyStatus = (next: StatusFilter) => {
    setStatusFilter(next)
    if (next === 'ALL') {
      setSearchParams({})
    } else {
      setSearchParams({ statut: next })
    }
  }

  const confirmValidate = () => {
    if (!pendingValidate) return
    acceptTrainerSession(pendingValidate.id)
    setPendingValidate(null)
    setVersion((v) => v + 1)
    pushToast({
      title: 'Séance validée',
      description: 'Elle apparaît maintenant avec le badge Validée.',
      tone: 'success',
    })
  }

  const confirmRefuse = () => {
    if (!pendingRefuse) return
    const wasValidated =
      pendingRefuse.status === 'PUBLISHED' ||
      pendingRefuse.status === 'POSTPONED'
    refuseTrainerSession(
      pendingRefuse.id,
      wasValidated
        ? 'Refus après validation (démo).'
        : 'Refusée par le formateur.',
    )
    setPendingRefuse(null)
    setVersion((v) => v + 1)
    pushToast({
      title: 'Séance refusée',
      description: 'L’administration est informée (démo).',
      tone: 'info',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Mes séances
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Validez les propositions admin. Une séance validée peut être refusée
          jusqu’à {REFUSE_MIN_DAYS_BEFORE} jours avant la date.
        </p>
      </header>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Statut
          </span>
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              active={statusFilter === filter.id}
              onClick={() =>
                applyStatus(
                  filter.id === 'ALL'
                    ? 'ALL'
                    : statusFilter === filter.id
                      ? 'ALL'
                      : filter.id,
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              {filter.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="liste-seances">
        <h2 id="liste-seances" className="font-display text-xl font-semibold">
          Séances ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucune séance avec ce filtre.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <SessionListCard
                  session={session}
                  onValidate={() => setPendingValidate(session)}
                  onRefuse={() => setPendingRefuse(session)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingValidate !== null}
        title="Valider cette séance ?"
        message={
          pendingValidate
            ? `${pendingValidate.chapter} — elle passera en Validée et sera visible pour les élèves.`
            : ''
        }
        confirmLabel="Valider"
        cancelLabel="Annuler"
        onConfirm={confirmValidate}
        onCancel={() => setPendingValidate(null)}
      />

      <ConfirmDialog
        open={pendingRefuse !== null}
        title="Refuser cette séance ?"
        message={
          pendingRefuse?.status === 'PUBLISHED' ||
          pendingRefuse?.status === 'POSTPONED'
            ? `Refus possible jusqu’à ${REFUSE_MIN_DAYS_BEFORE} jours avant. Les élèves inscrits devront être prévenus (démo).`
            : 'L’administration sera informée du refus.'
        }
        confirmLabel="Refuser"
        cancelLabel="Annuler"
        onConfirm={confirmRefuse}
        onCancel={() => setPendingRefuse(null)}
      />
    </div>
  )
}

function SessionListCard({
  session,
  onValidate,
  onRefuse,
}: {
  session: TrainerSession
  onValidate: () => void
  onRefuse: () => void
}) {
  const showValidate = canValidateFromList(session)
  const showRefuse = canRefuseValidatedSession(session)

  const stop = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <article className="rounded-xl border border-base-300 bg-white p-4 transition hover:border-primary/40">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold">
            {session.subject}
          </p>
          <p className="mt-0.5 text-sm text-base-content/90">
            {session.chapter}
          </p>
        </div>
        <TrainerSessionStatusBadge status={session.status} />
      </div>

      <dl className="mt-3 flex flex-col gap-1.5 text-sm text-base-content/90">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {formatSessionDate(session.date)} · {session.startTime}–
            {session.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{session.room}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {session.classLabel} · {session.groupLabel} ·{' '}
            {session.status === 'PENDING'
              ? `${session.seatsTotal} places prévues`
              : `${session.seatsTaken}/${session.seatsTotal} places`}
            {session.status !== 'PENDING' &&
            session.seatsTaken === 0 &&
            (session.status === 'PUBLISHED' || session.status === 'POSTPONED')
              ? ' · aucune inscription'
              : ''}
          </span>
        </div>
        {session.pricing === 'FREE' ? (
          <div className="flex items-center gap-2">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="badge badge-ghost h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none">
              {trainerPricingLabel('FREE')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-base-content/90">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <span>Prix</span>
              <span className="inline-flex items-center bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
                {formatTrainerSessionPrice(session) ?? '—'}
              </span>
            </span>
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-base-200 pt-3">
        <Link
          to={`/formateur/seances/${session.id}`}
          className="inline-flex min-h-10 items-center gap-1 text-sm text-primary"
        >
          Voir le détail
          <ChevronRight className="size-4" aria-hidden />
        </Link>

        {showValidate ? (
          <Button
            type="button"
            size="sm"
            className="min-h-10 gap-1.5"
            onClick={(event) => {
              stop(event)
              onValidate()
            }}
          >
            <Check className="size-3.5" aria-hidden />
            Valider
          </Button>
        ) : null}

        {showRefuse ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-10 gap-1.5 border-error text-error hover:bg-error/10"
            onClick={(event) => {
              stop(event)
              onRefuse()
            }}
          >
            <X className="size-3.5" aria-hidden />
            Refuser
          </Button>
        ) : null}
      </div>
    </article>
  )
}

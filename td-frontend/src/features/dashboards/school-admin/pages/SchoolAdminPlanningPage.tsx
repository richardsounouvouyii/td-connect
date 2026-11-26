import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Plus,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { AdminSessionStatusBadge } from '@/features/dashboards/school-admin/components/AdminSessionStatusBadge'
import { OfferKindBadge } from '@/features/dashboards/school-admin/components/OfferKindBadge'
import {
  listAdminPlanningRows,
  type AdminPlanningFilter,
  type AdminPlanningRow,
} from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import {
  adminPricingLabel,
  formatAdminSessionPrice,
  formatSessionDate,
  initialsFromName,
  shortTrainerLabel,
} from '@/features/dashboards/school-admin/lib/format'
import { ADMIN_CLASSES } from '@/features/dashboards/school-admin/mocks/admin-catalog'
import type { AdminSession } from '@/features/dashboards/school-admin/types'

type StatusFilter = AdminPlanningFilter

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PUBLIC', label: 'Publiques' },
  { id: 'PENDING', label: 'Attente formateur' },
  { id: 'PUBLISHED', label: 'Validées' },
  { id: 'POSTPONED', label: 'Reportées' },
  { id: 'REJECTED', label: 'Refusées' },
  { id: 'CANCELLED', label: 'Annulées' },
  { id: 'COMPLETED', label: 'Terminées' },
]

function isStatusFilter(value: string | null): value is StatusFilter {
  return STATUS_FILTERS.some((filter) => filter.id === value)
}

function buildPlanningParams(next: {
  statut?: StatusFilter
  classe?: string | null
}) {
  const params = new URLSearchParams()
  if (next.statut && next.statut !== 'ALL') params.set('statut', next.statut)
  if (next.classe) params.set('classe', next.classe)
  return params
}

/** Planning établissement — propositions, validations, packs. */
export function SchoolAdminPlanningPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = searchParams.get('statut')
  const classFromQuery = searchParams.get('classe')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    isStatusFilter(initial) ? initial : 'ALL',
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
  const [version] = useState(0)

  const rows = useMemo(() => {
    void version
    return listAdminPlanningRows(statusFilter).filter((row) => {
      if (!classFilter) return true
      const session =
        row.kind === 'session' ? row.session : row.representative
      return session.classLabel === classFilter
    })
  }, [statusFilter, classFilter, version])

  const applyStatus = (next: StatusFilter) => {
    setStatusFilter(next)
    setSearchParams(
      buildPlanningParams({ statut: next, classe: classFilter }),
    )
  }

  const applyClass = (next: string | null) => {
    setClassFilter(next)
    setSearchParams(
      buildPlanningParams({ statut: statusFilter, classe: next }),
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Planning
          </h1>
          <p className="mt-1 font-sans text-base text-base-content/90">
            Proposez des séances aux formateurs et joignez le pack épreuve /
            corrigé.
          </p>
        </div>
        <Link
          to={
            classFilter
              ? `/admin-etablissement/planning/nouvelle?classe=${encodeURIComponent(classFilter)}`
              : '/admin-etablissement/planning/nouvelle'
          }
        >
          <Button type="button" className="min-h-11 gap-2">
            <Plus className="size-4" aria-hidden />
            Proposer
          </Button>
        </Link>
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
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-base-200 pt-2">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Classe
          </span>
          <FilterChip
            active={classFilter === null}
            onClick={() => applyClass(null)}
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Toutes
          </FilterChip>
          {ADMIN_CLASSES.map((label) => (
            <FilterChip
              key={label}
              active={classFilter === label}
              onClick={() =>
                applyClass(classFilter === label ? null : label)
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="liste-planning-admin">
        <h2
          id="liste-planning-admin"
          className="font-display text-xl font-semibold"
        >
          Séances ({rows.length})
        </h2>

        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucune séance avec ce filtre.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                {row.kind === 'publicOffer' ? (
                  <AdminPublicOfferCard row={row} />
                ) : (
                  <AdminSessionCard session={row.session} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function AdminPublicOfferCard({
  row,
}: {
  row: Extract<AdminPlanningRow, { kind: 'publicOffer' }>
}) {
  const session = row.representative
  const priceLabel = formatAdminSessionPrice(session)
  const packLabel =
    session.hasAdminExam && session.hasAdminCorrection
      ? 'Pack complet'
      : session.hasAdminExam || session.hasAdminCorrection
        ? 'Pack partiel'
        : 'Pack manquant'

  const trainerLine =
    row.status === 'PUBLISHED' && row.winnerName
      ? `Validée par ${row.winnerName}`
      : row.status === 'PENDING'
        ? `Offre publique · ${row.pendingCount}/${row.trainerNames.length} en attente`
        : `Offre publique · ${row.trainerNames.join(' · ')}`

  return (
    <Link
      to={`/admin-etablissement/planning/${session.id}`}
      className="block rounded-xl border-2 border-primary/40 bg-primary/5 p-4 transition hover:border-primary/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <OfferKindBadge kind="public" />
          <p className="mt-2 font-display text-lg font-semibold">
            {session.chapter}
          </p>
          <p className="mt-0.5 text-sm text-base-content/90">
            {session.subject} · {session.groupLabel}
          </p>
        </div>
        <AdminSessionStatusBadge status={row.status} />
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
          <Users className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{trainerLine}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {session.room} · {session.classLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            {session.pricing === 'FREE' ? (
              <span className="badge badge-ghost h-auto min-h-0 border-0 px-2.5 py-1 text-xs">
                {adminPricingLabel('FREE')}
              </span>
            ) : (
              <span className="inline-flex items-center bg-success px-2 py-0.5 text-sm font-bold text-success-content">
                {priceLabel ?? '—'}
              </span>
            )}
          </span>
          <span className="text-xs text-base-content/70">{packLabel}</span>
        </div>
      </dl>

      {row.statusNote && row.status === 'CANCELLED' ? (
        <p className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium">
          {row.statusNote}
        </p>
      ) : null}

      <div className="mt-3 flex min-h-9 items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-sm text-primary">
          Voir le détail
          <ChevronRight className="size-4" aria-hidden />
        </span>
        <span className="truncate text-sm font-medium text-base-content/80">
          {row.trainerNames.length} formateur
          {row.trainerNames.length > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  )
}

function AdminSessionCard({ session }: { session: AdminSession }) {
  const priceLabel = formatAdminSessionPrice(session)
  const packLabel =
    session.hasAdminExam && session.hasAdminCorrection
      ? 'Pack complet'
      : session.hasAdminExam || session.hasAdminCorrection
        ? 'Pack partiel'
        : 'Pack manquant'

  return (
    <Link
      to={`/admin-etablissement/planning/${session.id}`}
      className="block rounded-xl border border-base-300 bg-white p-4 transition hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <OfferKindBadge kind="direct" />
          <p className="mt-2 font-display text-lg font-semibold">
            {session.chapter}
          </p>
          <p className="mt-0.5 text-sm text-base-content/90">
            {session.subject} · {session.groupLabel}
          </p>
        </div>
        <AdminSessionStatusBadge status={session.status} />
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
          <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{session.trainerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {session.room} · {session.classLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            {session.pricing === 'FREE' ? (
              <span className="badge badge-ghost h-auto min-h-0 border-0 px-2.5 py-1 text-xs">
                {adminPricingLabel('FREE')}
              </span>
            ) : (
              <span className="inline-flex items-center bg-success px-2 py-0.5 text-sm font-bold text-success-content">
                {priceLabel ?? '—'}
              </span>
            )}
          </span>
          <span className="text-xs text-base-content/70">{packLabel}</span>
        </div>
      </dl>

      <div className="mt-3 flex min-h-9 items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-sm text-primary">
          Voir le détail
          <ChevronRight className="size-4" aria-hidden />
        </span>
        <span
          className="inline-flex max-w-[55%] items-center gap-2 text-sm text-base-content/80"
          title={session.trainerName}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold tracking-wide text-primary"
            aria-hidden
          >
            {initialsFromName(session.trainerName)}
          </span>
          <span className="truncate font-medium">
            {shortTrainerLabel(session.trainerName)}
          </span>
        </span>
      </div>
    </Link>
  )
}

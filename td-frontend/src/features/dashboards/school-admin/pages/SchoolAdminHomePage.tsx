import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileWarning,
  MapPin,
  Settings,
  UserRound,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { AdminSessionStatusBadge } from '@/features/dashboards/school-admin/components/AdminSessionStatusBadge'
import { OfferKindBadge } from '@/features/dashboards/school-admin/components/OfferKindBadge'
import { listUpcomingAdminPlanningRows } from '@/features/dashboards/school-admin/lib/admin-planning-rows'
import {
  formatSessionDate,
  formatShortDate,
} from '@/features/dashboards/school-admin/lib/format'
import {
  ADMIN_RECENT_ALERTS,
  getAdminHomeStats,
} from '@/features/dashboards/school-admin/mocks/admin-home'
import { cn } from '@/lib/cn'

/** Accueil admin établissement — pilotage planning / packs / formateurs. */
export function SchoolAdminHomePage() {
  const { user } = useAuth()
  if (!user) return null

  const stats = getAdminHomeStats()
  const upcoming = listUpcomingAdminPlanningRows(8)
  const alerts = ADMIN_RECENT_ALERTS

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Espace administrateur d’établissement
        </p>
        <h1 className="mt-0.5 font-display text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
          Bonjour, {user.fullName}
        </h1>
        <p className="mt-1 text-sm text-base-content/90">
          {user.establishmentName ?? 'Établissement'} · Planning TD · Formateurs
          · Packs épreuves
        </p>
      </header>

      <section
        aria-label="Indicateurs"
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          to="/admin-etablissement/planning?statut=PENDING"
          icon={Clock3}
          label="En attente formateur"
          value={stats.pendingTrainer}
          tone="warning"
        />
        <StatCard
          to="/admin-etablissement/planning?statut=PUBLISHED"
          icon={CalendarDays}
          label="Séances à venir"
          value={stats.upcoming}
          tone="primary"
        />
        <StatCard
          to="/admin-etablissement/documents?pack=MISSING"
          icon={FileWarning}
          label="Packs incomplets"
          value={stats.missingPacks}
          tone="error"
        />
        <StatCard
          to="/admin-etablissement/classes"
          icon={UserRound}
          label="Classes"
          value={stats.classes}
          tone="primary"
        />
      </section>

      {stats.pendingTrainer > 0 ? (
        <Link
          to="/admin-etablissement/planning?statut=PENDING"
          className="flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 transition hover:border-warning/60"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-warning/20 text-warning">
              <ClipboardList className="size-4" aria-hidden />
            </span>
            <div>
              <p className="font-medium">
                {stats.pendingTrainer} proposition
                {stats.pendingTrainer > 1 ? 's' : ''} en attente
              </p>
              <p className="text-sm text-base-content/80">
                Directes ou publiques — le premier qui valide gagne l’offre
                publique
              </p>
            </div>
          </div>
          <ChevronRight
            className="size-4 shrink-0 text-base-content/50"
            aria-hidden
          />
        </Link>
      ) : null}

      <section aria-labelledby="prochaines-seances-admin">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="prochaines-seances-admin"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Prochaines séances
          </h2>
          <Link
            to="/admin-etablissement/planning"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Planning
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-6 text-base-content/90">
            Aucune séance à venir.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {upcoming.map((row) => {
              const session =
                row.kind === 'session' ? row.session : row.representative
              const status =
                row.kind === 'session' ? row.session.status : row.status
              const isPublic = row.kind === 'publicOffer'
              const detailId = session.id
              const trainerLabel = isPublic
                ? row.status === 'PUBLISHED' && row.winnerName
                  ? `Validée par ${row.winnerName}`
                  : `Offre publique · ${row.trainerNames.join(' · ')}`
                : session.trainerName

              return (
                <li key={row.id}>
                  <Link
                    to={`/admin-etablissement/planning/${detailId}`}
                    className={cn(
                      'block rounded-xl border p-4 transition hover:border-primary/40',
                      isPublic
                        ? 'border-2 border-primary/40 bg-primary/5'
                        : 'border-base-300 bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <OfferKindBadge
                          kind={isPublic ? 'public' : 'direct'}
                        />
                        <p className="mt-2 font-display text-lg font-semibold">
                          {session.subject}
                        </p>
                        <p className="mt-0.5 text-base text-base-content/90">
                          {session.chapter}
                        </p>
                      </div>
                      <AdminSessionStatusBadge status={status} />
                    </div>
                    <dl className="mt-3 flex flex-col gap-1.5 text-sm text-base-content/90">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className="size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span>
                          {formatSessionDate(session.date)} ·{' '}
                          {session.startTime}–{session.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPublic ? (
                          <Users
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                        ) : (
                          <UserRound
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                        )}
                        <span>{trainerLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span>
                          {session.room} · {session.classLabel} ·{' '}
                          {session.groupLabel}
                        </span>
                      </div>
                    </dl>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="alertes-admin">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="alertes-admin"
            className="font-display text-xl font-semibold tracking-tight"
          >
            À surveiller
          </h2>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <Link
                to={alert.href ?? '/admin-etablissement/planning'}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition hover:border-primary/40',
                  alert.tone === 'warning'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-base-300 bg-white',
                )}
              >
                <div>
                  <p className="text-sm text-base-content">{alert.message}</p>
                  <p className="mt-1 text-xs text-base-content/70">
                    {formatShortDate(alert.createdAt)}
                  </p>
                </div>
                <ChevronRight
                  className="mt-0.5 size-4 shrink-0 text-base-content/40"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="acces-rapides-admin">
        <h2
          id="acces-rapides-admin"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Accès rapides
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <QuickLink
            to="/admin-etablissement/planning/nouvelle"
            icon={ClipboardList}
            label="Proposer une séance"
          />
          <QuickLink
            to="/admin-etablissement/planning"
            icon={CalendarDays}
            label="Voir le planning"
          />
          <QuickLink
            to="/admin-etablissement/classes"
            icon={UserRound}
            label="Classes"
          />
          <QuickLink
            to="/admin-etablissement/documents"
            icon={BookOpen}
            label="Documents"
          />
          <QuickLink
            to="/admin-etablissement/parametres"
            icon={Settings}
            label="Paramètres"
          />
        </ul>
      </section>
    </div>
  )
}

function StatCard({
  to,
  icon: Icon,
  label,
  value,
  tone,
}: {
  to: string
  icon: typeof Clock3
  label: string
  value: number
  tone: 'primary' | 'warning' | 'error'
}) {
  const toneClass =
    tone === 'warning'
      ? 'bg-warning/15 text-warning'
      : tone === 'error'
        ? 'bg-error/10 text-error'
        : 'bg-primary/10 text-primary'

  return (
    <Link
      to={to}
      className="rounded-xl border border-base-300 bg-white px-3 py-2.5 transition hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-xl font-semibold leading-none">
          {value}
        </p>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            toneClass,
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-base-content/80">{label}</p>
    </Link>
  )
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof CalendarDays
  label: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-11 items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 transition hover:border-primary/40 hover:bg-base-200/60"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  )
}

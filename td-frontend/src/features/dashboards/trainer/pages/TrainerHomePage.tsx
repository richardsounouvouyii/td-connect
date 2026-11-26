import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { TrainerSessionStatusBadge } from '@/features/dashboards/trainer/components/TrainerSessionStatusBadge'
import { formatSessionDate, formatShortDate } from '@/features/dashboards/trainer/lib/format'
import {
  getTrainerPendingCount,
  TRAINER_PROFILE_DEMO,
  TRAINER_RECENT_ALERTS,
  TRAINER_UPCOMING_SESSIONS,
} from '@/features/dashboards/trainer/mocks/trainer-home'

/** Accueil espace FORMATEUR — prochaines séances, alertes, suivi. */
export function TrainerHomePage() {
  const { user } = useAuth()
  if (!user) return null

  const nextSessions = TRAINER_UPCOMING_SESSIONS.slice(0, 3)
  const alerts = TRAINER_RECENT_ALERTS
  const pendingCount = getTrainerPendingCount()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Espace formateur
        </p>
        <h1 className="mt-0.5 font-display text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
          Bonjour, {user.fullName}
        </h1>
        <p className="mt-1 text-sm text-base-content/90">
          {user.establishmentName ?? 'Établissement'} ·{' '}
          {TRAINER_PROFILE_DEMO.subjects.join(' · ')} ·{' '}
          {TRAINER_PROFILE_DEMO.groups.join(' · ')}
        </p>
      </header>

      {pendingCount > 0 ? (
        <Link
          to="/formateur/seances?statut=PENDING"
          className="flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 transition hover:border-warning/60"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-warning/20 text-warning">
              <Clock3 className="size-4" aria-hidden />
            </span>
            <div>
              <p className="font-medium">
                {pendingCount} séance
                {pendingCount > 1 ? 's' : ''} à valider
              </p>
              <p className="text-sm text-base-content/80">
                Valider ou refuser — prix inclus
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-base-content/50" aria-hidden />
        </Link>
      ) : null}

      <section aria-labelledby="prochaines-seances">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="prochaines-seances"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Prochaines séances
          </h2>
          <Link
            to="/formateur/seances"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Mes séances
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {nextSessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-6 text-base-content/90">
            Aucune séance à venir.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {nextSessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={`/formateur/seances/${session.id}`}
                  className="block rounded-xl border border-base-300 bg-white p-4 transition hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {session.subject}
                      </p>
                      <p className="mt-0.5 text-base text-base-content/90">
                        {session.chapter}
                      </p>
                    </div>
                    <TrainerSessionStatusBadge status={session.status} />
                  </div>
                  <dl className="mt-3 flex flex-col gap-1.5 text-sm text-base-content/90">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>
                        {formatSessionDate(session.date)} · {session.startTime}–
                        {session.endTime}
                      </span>
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
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="alertes-formateur">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="alertes-formateur"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Alertes récentes
          </h2>
          <Link
            to="/formateur/notifications"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Toutes
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex gap-3 rounded-xl border border-base-300 bg-white px-4 py-3"
            >
              <Bell
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <p className="text-base text-base-content/90">{alert.message}</p>
                <p className="mt-1 text-sm text-base-content/80">
                  {formatShortDate(alert.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="acces-rapides">
        <h2
          id="acces-rapides"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Accès rapides
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <li>
            <Link
              to="/formateur/seances"
              className="flex min-h-11 items-center gap-3 rounded-xl border border-base-300 bg-white px-3 py-2.5 transition hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="size-4" aria-hidden />
              </span>
              <span className="font-medium">Mes séances</span>
            </Link>
          </li>
          <li>
            <Link
              to="/formateur/disponibilites"
              className="flex min-h-11 items-center gap-3 rounded-xl border border-base-300 bg-white px-3 py-2.5 transition hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-4" aria-hidden />
              </span>
              <span className="font-medium">Programme</span>
            </Link>
          </li>
          <li>
            <Link
              to="/formateur/documents"
              className="flex min-h-11 items-center gap-3 rounded-xl border border-base-300 bg-white px-3 py-2.5 transition hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4" aria-hidden />
              </span>
              <span className="font-medium">Documents</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}

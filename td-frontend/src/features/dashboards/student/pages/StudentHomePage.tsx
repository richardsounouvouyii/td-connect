import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  SessionPricingLabel,
  SessionPricingRow,
} from '@/features/dashboards/student/components/SessionPricingRow'
import { SessionStatusBadge } from '@/features/dashboards/student/components/SessionStatusBadge'
import {
  formatSessionDate,
  formatShortDate,
} from '@/features/dashboards/student/lib/format'
import {
  STUDENT_PROFILE_DEMO,
  STUDENT_RECENT_ALERTS,
  STUDENT_RECENT_DOCUMENTS,
  STUDENT_UPCOMING_SESSIONS,
} from '@/features/dashboards/student/mocks/student-home'

/** Accueil espace ÉLÈVE — prochaines séances, alertes, documents. */
export function StudentHomePage() {
  const { user } = useAuth()
  if (!user) return null

  const nextSessions = STUDENT_UPCOMING_SESSIONS.slice(0, 3)
  const documents = STUDENT_RECENT_DOCUMENTS
  const alerts = STUDENT_RECENT_ALERTS

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header>
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Espace élève
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Bonjour, {user.fullName}
        </h1>
        <p className="mt-2 text-base text-base-content/90">
          {user.establishmentName ?? 'Établissement'} ·{' '}
          {STUDENT_PROFILE_DEMO.classLabel} ·{' '}
          {STUDENT_PROFILE_DEMO.groups.slice(0, 2).join(' · ')}
          {STUDENT_PROFILE_DEMO.groups.length > 2
            ? ` · +${STUDENT_PROFILE_DEMO.groups.length - 2}`
            : ''}
        </p>
      </header>

      <section aria-labelledby="prochains-td">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="prochains-td"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Prochains TD
          </h2>
          <Link
            to="/eleve/planning"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Voir le planning
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {nextSessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-base-100 px-4 py-6 text-base-content/90">
            Aucune séance à venir pour le moment.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {nextSessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={`/eleve/planning/${session.id}`}
                  className="block rounded-xl border border-base-300 bg-base-100 p-4 transition hover:border-primary/40 hover:bg-base-200/40"
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
                    <SessionStatusBadge status={session.status} />
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
                        {session.room} · Groupe {session.groupLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate">{session.trainerName}</span>
                      {session.pricing === 'FREE' ? (
                        <SessionPricingLabel pricing="FREE" />
                      ) : null}
                    </div>
                  </dl>
                  {session.pricing === 'PAID' ? (
                    <div className="mt-1.5">
                      <SessionPricingRow session={session} />
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="changements">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="changements"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Changements récents
          </h2>
          <Link
            to="/eleve/notifications"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Alertes
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3"
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

      <section aria-labelledby="documents">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="documents"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Épreuves et corrigés publiés
          </h2>
          <Link
            to="/eleve/epreuves"
            className="link link-primary inline-flex min-h-11 items-center gap-1 text-sm no-underline"
          >
            Catalogue
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                to="/eleve/epreuves"
                className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 transition hover:border-primary/40"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.title}</p>
                  <p className="text-sm text-base-content/90">
                    {doc.kind === 'EXAM' ? 'Épreuve' : 'Corrigé'} · {doc.subject}{' '}
                    · {formatShortDate(doc.publishedAt)}
                  </p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-base-content/50"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

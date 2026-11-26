import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Plus,
  UserRound,
  Users,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { AdminSessionStatusBadge } from '@/features/dashboards/school-admin/components/AdminSessionStatusBadge'
import { OfferKindBadge } from '@/features/dashboards/school-admin/components/OfferKindBadge'
import {
  countSessionsForClass,
  getAdminClassById,
  listTrainersForClass,
  listUpcomingRowsForClass,
} from '@/features/dashboards/school-admin/mocks/admin-classes'
import {
  formatSessionDate,
  initialsFromName,
} from '@/features/dashboards/school-admin/lib/format'

/** Détail d’une classe : groupes, formateurs, prochaines séances. */
export function SchoolAdminClassDetailPage() {
  const { classId } = useParams()
  const classItem = classId ? getAdminClassById(classId) : undefined

  if (!classItem) {
    return <Navigate to="/admin-etablissement/classes" replace />
  }

  const trainers = listTrainersForClass(classItem)
  const sessionStats = countSessionsForClass(classItem.label)
  const upcoming = listUpcomingRowsForClass(classItem.label, 3)
  const classQuery = encodeURIComponent(classItem.label)
  const proposeHref = `/admin-etablissement/planning/nouvelle?classe=${classQuery}`
  const planningHref = `/admin-etablissement/planning?classe=${classQuery}`

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="sticky top-[3.75rem] z-20 -mx-4 -mt-5 border-b border-base-300/70 bg-base-100/95 px-4 py-1.5 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link to="/admin-etablissement/classes" className="inline-flex w-fit">
          <Button variant="ghost" className="min-h-10 gap-2 px-2">
            <ArrowLeft className="size-4" aria-hidden />
            Retour aux classes
          </Button>
        </Link>
      </div>

      <header className="rounded-xl border border-base-300 bg-white p-4 sm:p-5">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          {classItem.level} · {classItem.schoolYear}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {classItem.label}
        </h1>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-base-content/80">
              <Users className="size-4 shrink-0 text-primary" aria-hidden />
              Élèves
            </span>
            <span className="font-medium">{classItem.studentCount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-base-content/80">
              <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
              Groupes TD
            </span>
            <span className="font-medium">{classItem.groups.length}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-base-content/80">
              <GraduationCap
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              Formateurs
            </span>
            <span className="font-medium">{trainers.length}</span>
          </div>
        </dl>
      </header>

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Groupes TD
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {classItem.groups.map((group) => (
            <li
              key={group.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-base-200 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{group.label}</p>
                <p className="text-xs text-base-content/70">{group.subject}</p>
              </div>
              <span className="text-sm text-base-content/80">
                {group.studentCount} élève
                {group.studentCount > 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Formateurs
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {trainers.map((trainer) => (
            <li
              key={trainer.id}
              className="flex items-center gap-3 border border-base-200 px-3 py-2.5"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-xs font-semibold text-primary"
                aria-hidden
              >
                {initialsFromName(trainer.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{trainer.fullName}</p>
                <p className="text-xs text-base-content/70">
                  {trainer.subjects.join(' · ')}
                </p>
              </div>
              <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Prochaines séances
          </h2>
          <Link
            to={planningHref}
            className="link link-primary inline-flex min-h-10 items-center gap-1 text-sm no-underline"
          >
            Planning
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-base-content/70">
            Aucune séance à venir pour cette classe.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {upcoming.map((row) => {
              const session =
                row.kind === 'session' ? row.session : row.representative
              const status =
                row.kind === 'session' ? row.session.status : row.status
              const isPublic = row.kind === 'publicOffer'
              const detailId = session.id
              const trainerLabel = isPublic
                ? status === 'PUBLISHED' && row.winnerName
                  ? `Validée par ${row.winnerName}`
                  : row.trainerNames.join(' · ')
                : session.trainerName

              return (
                <li key={row.id}>
                  <Link
                    to={`/admin-etablissement/planning/${detailId}`}
                    className="block border border-base-200 px-3 py-2.5 transition hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="mb-1.5">
                          <OfferKindBadge
                            kind={isPublic ? 'public' : 'direct'}
                          />
                        </div>
                        <p className="text-sm font-medium">{session.chapter}</p>
                        <p className="text-xs text-base-content/70">
                          {session.subject} · {trainerLabel}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-base-content/80">
                          <CalendarDays
                            className="size-3.5 shrink-0 text-primary"
                            aria-hidden
                          />
                          {formatSessionDate(session.date)} · {session.startTime}
                          –{session.endTime}
                        </p>
                      </div>
                      <AdminSessionStatusBadge status={status} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Planning lié
        </h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base-content/80">Séances au total</span>
            <span className="font-medium">{sessionStats.total}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-base-content/80">En attente</span>
            <span className="font-medium">{sessionStats.pending}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-base-content/80">Validées</span>
            <span className="font-medium">{sessionStats.published}</span>
          </div>
        </dl>
        <div className="mt-4 flex flex-nowrap items-stretch gap-2">
          <Link to={proposeHref} className="min-w-0 flex-1">
            <Button
              type="button"
              className="min-h-11 w-full gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Proposer une séance</span>
            </Button>
          </Link>
          <Link to={planningHref} className="min-w-0 flex-1">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-1.5 border-2 border-base-content/35 px-2 text-sm sm:gap-2 sm:px-3"
            >
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Voir le planning</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

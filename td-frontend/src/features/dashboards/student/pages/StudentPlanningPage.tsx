import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { SessionCard } from '@/features/dashboards/student/components/SessionCard'
import {
  applyPlanningFilters,
  dayHasSessions,
  formatDayHeading,
  formatPlanningTitle,
  getViewInterval,
  groupSessionsByDay,
  isInCurrentMonth,
  isViewingPlanningToday,
  monthGridDays,
  PLANNING_DEMO_TODAY,
  sessionsForDay,
  sessionsForRange,
  shiftAnchor,
  uniqueSubjects,
  type PlanningView,
} from '@/features/dashboards/student/lib/planning'
import { sessionStatusLabel } from '@/features/dashboards/student/lib/format'
import { STUDENT_SESSIONS } from '@/features/dashboards/student/mocks/student-sessions'
import type { SessionStatus } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

const views: { id: PlanningView; label: string }[] = [
  { id: 'day', label: 'Jour' },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
]

const STATUS_FILTERS: SessionStatus[] = [
  'PUBLISHED',
  'POSTPONED',
  'CANCELLED',
  'COMPLETED',
]

/** Planning élève — vues jour / semaine / mois. */
export function StudentPlanningPage() {
  const [view, setView] = useState<PlanningView>('week')
  const [anchor, setAnchor] = useState(() => PLANNING_DEMO_TODAY)
  const [selectedDay, setSelectedDay] = useState(() => PLANNING_DEMO_TODAY)
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | null>(null)

  const subjects = useMemo(() => uniqueSubjects(STUDENT_SESSIONS), [])

  const { start, end } = useMemo(
    () => getViewInterval(view, anchor),
    [view, anchor],
  )

  const filteredCatalog = useMemo(
    () =>
      applyPlanningFilters(STUDENT_SESSIONS, {
        subject: subjectFilter,
        status: statusFilter,
      }),
    [subjectFilter, statusFilter],
  )

  const sessions = useMemo(() => {
    if (view === 'day') return sessionsForDay(filteredCatalog, anchor)
    if (view === 'week') return sessionsForRange(filteredCatalog, start, end)
    return sessionsForDay(filteredCatalog, selectedDay)
  }, [view, anchor, start, end, selectedDay, filteredCatalog])

  const dayGroups = useMemo(
    () => (view === 'week' ? groupSessionsByDay(sessions) : []),
    [view, sessions],
  )

  const monthDays = useMemo(
    () => (view === 'month' ? monthGridDays(anchor) : []),
    [view, anchor],
  )

  const title = formatPlanningTitle(view, anchor)
  const hasActiveFilters = subjectFilter !== null || statusFilter !== null
  const showTodayLabel =
    (view === 'day' || view === 'month') &&
    isViewingPlanningToday(view, anchor, selectedDay)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Planning
        </h1>
        <p className="mt-1 text-base text-base-content/90">
          Consultez vos séances de TD par jour, semaine ou mois.
        </p>
      </header>

      <div
        className="flex rounded-xl border border-base-300 bg-base-100 p-1"
        role="tablist"
        aria-label="Type de vue"
      >
        {views.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            className={cn(
              'min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition',
              view === id
                ? 'bg-primary text-primary-content'
                : 'text-base-content/80 hover:bg-base-200',
            )}
            onClick={() => {
              setView(id)
              if (id === 'month') setSelectedDay(anchor)
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 min-w-11 shrink-0 px-0"
          aria-label="Période précédente"
          onClick={() => {
            const next = shiftAnchor(view, anchor, -1)
            setAnchor(next)
            if (view === 'month') setSelectedDay(next)
          }}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-base font-semibold capitalize sm:text-lg">
            {title}
          </p>
          {showTodayLabel ? (
            <p className="mt-0.5 text-sm font-medium text-primary">
              Aujourd’hui
            </p>
          ) : null}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="min-h-11 min-w-11 shrink-0 px-0"
          aria-label="Période suivante"
          onClick={() => {
            const next = shiftAnchor(view, anchor, 1)
            setAnchor(next)
            if (view === 'month') setSelectedDay(next)
          }}
        >
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5"
      >
        <div className="flex flex-col gap-2">
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
              Statut
            </span>
            <FilterChip
              active={statusFilter === null}
              onClick={() => setStatusFilter(null)}
            >
              Tous
            </FilterChip>
            {STATUS_FILTERS.map((status) => (
              <FilterChip
                key={status}
                active={statusFilter === status}
                onClick={() =>
                  setStatusFilter((current) =>
                    current === status ? null : status,
                  )
                }
              >
                {sessionStatusLabel(status)}
              </FilterChip>
            ))}
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="link link-primary self-start text-xs no-underline"
              onClick={() => {
                setSubjectFilter(null)
                setStatusFilter(null)
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </section>

      {view === 'month' ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-3">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-base-content/80">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const hasSession = dayHasSessions(filteredCatalog, day)
              const selected = isSameDay(day, selectedDay)
              const inMonth = isInCurrentMonth(day, anchor)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'flex min-h-11 flex-col items-center justify-center rounded-lg text-sm transition',
                    !inMonth && 'text-base-content/40',
                    selected && 'bg-primary text-primary-content',
                    !selected && inMonth && 'hover:bg-base-200',
                    isToday(day) && !selected && 'ring-1 ring-primary/40',
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {hasSession ? (
                    <span
                      className={cn(
                        'mt-0.5 size-1.5 rounded-full',
                        selected ? 'bg-primary-content' : 'bg-primary',
                      )}
                    />
                  ) : (
                    <span className="mt-0.5 size-1.5" />
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-sm text-base-content/90">
            Jour sélectionné :{' '}
            <span className="font-medium capitalize">
              {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
            </span>
          </p>
        </div>
      ) : null}

      <section aria-labelledby="liste-seances">
        <h2 id="liste-seances" className="font-display text-xl font-semibold">
          {view === 'month' ? 'Séances du jour' : 'Séances'}
        </h2>

        {sessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-base-100 px-4 py-8 text-center text-base-content/90">
            Aucune séance sur cette période
            {hasActiveFilters ? ' avec ces filtres' : ''}.
          </p>
        ) : view === 'week' ? (
          <div className="mt-4 flex flex-col gap-6">
            {dayGroups.map((group) => (
              <div key={group.date}>
                <h3 className="mb-3 font-display text-base font-semibold capitalize text-base-content/90">
                  {formatDayHeading(group.day)}
                </h3>
                <ul className="flex flex-col gap-3">
                  {group.sessions.map((session) => (
                    <li key={session.id}>
                      <SessionCard session={session} showDate={false} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <SessionCard
                  session={session}
                  showDate={view !== 'day'}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

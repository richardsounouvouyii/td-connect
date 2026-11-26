import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import {
  listAdminClassLevels,
  listAdminClasses,
  listTrainersForClass,
} from '@/features/dashboards/school-admin/mocks/admin-classes'
import { shortTrainerLabel } from '@/features/dashboards/school-admin/lib/format'
import type { AdminClassLevel } from '@/features/dashboards/school-admin/types'

type LevelFilter = 'ALL' | AdminClassLevel

/** Liste des classes de l’établissement. */
export function SchoolAdminClassesPage() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL')
  const levels = listAdminClassLevels()

  const classes = useMemo(() => {
    const all = listAdminClasses()
    if (levelFilter === 'ALL') return all
    return all.filter((item) => item.level === levelFilter)
  }, [levelFilter])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Classes
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Classes, groupes TD et formateurs rattachés à l’établissement.
        </p>
      </header>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="w-14 shrink-0 text-xs font-medium text-base-content/70">
            Niveau
          </span>
          <FilterChip
            active={levelFilter === 'ALL'}
            onClick={() => setLevelFilter('ALL')}
            className="shrink-0 px-2.5 sm:text-xs"
          >
            Tous
          </FilterChip>
          {levels.map((level) => (
            <FilterChip
              key={level}
              active={levelFilter === level}
              onClick={() =>
                setLevelFilter(levelFilter === level ? 'ALL' : level)
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              {level}
            </FilterChip>
          ))}
        </div>
      </section>

      <section aria-labelledby="liste-classes-admin">
        <h2
          id="liste-classes-admin"
          className="font-display text-xl font-semibold"
        >
          Classes ({classes.length})
        </h2>

        {classes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucune classe avec ce filtre.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {classes.map((item) => {
              const trainers = listTrainersForClass(item)
              const trainerPreview = trainers
                .slice(0, 3)
                .map((trainer) => shortTrainerLabel(trainer.fullName))
                .join(' · ')
              const moreTrainers =
                trainers.length > 3 ? ` +${trainers.length - 3}` : ''

              return (
                <li key={item.id}>
                  <Link
                    to={`/admin-etablissement/classes/${item.id}`}
                    className="block rounded-xl border border-base-300 bg-white p-4 transition hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium tracking-wide text-primary uppercase">
                          {item.level} · {item.schoolYear}
                        </p>
                        <p className="mt-1 font-display text-xl font-semibold">
                          {item.label}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-primary">
                        Voir
                        <ChevronRight className="size-4" aria-hidden />
                      </span>
                    </div>

                    <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-base-content/80">
                          <Users
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          Élèves
                        </span>
                        <span className="font-medium">{item.studentCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-base-content/80">
                          <BookOpen
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          Groupes TD
                        </span>
                        <span className="font-medium">{item.groups.length}</span>
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

                    {trainers.length > 0 ? (
                      <p className="mt-3 text-xs text-base-content/70">
                        {trainerPreview}
                        {moreTrainers}
                      </p>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

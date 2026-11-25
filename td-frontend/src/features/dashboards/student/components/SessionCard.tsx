import { CalendarDays, MapPin, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SessionParticipateButton } from '@/features/dashboards/student/components/SessionParticipateButton'
import {
  SessionPricingLabel,
  SessionPricingRow,
} from '@/features/dashboards/student/components/SessionPricingRow'
import { SessionStatusBadge } from '@/features/dashboards/student/components/SessionStatusBadge'
import { formatSessionDate } from '@/features/dashboards/student/lib/format'
import { canJoinSession } from '@/features/dashboards/student/lib/participation'
import type { StudentSession } from '@/features/dashboards/student/types'

type SessionCardProps = {
  session: StudentSession
  showDate?: boolean
}

export function SessionCard({ session, showDate = true }: SessionCardProps) {
  const isFree = session.pricing === 'FREE'
  const showJoin = canJoinSession(session)

  return (
    <article className="rounded-xl border border-base-300 bg-base-100 transition hover:border-primary/40 hover:bg-base-200/40">
      <Link
        to={`/eleve/planning/${session.id}`}
        className="block p-4 pb-3"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
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
          {showDate ? (
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
          ) : (
            <div className="flex items-center gap-2">
              <CalendarDays
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                {session.startTime}–{session.endTime}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <span>{session.room}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate">
                {session.trainerName} · {session.groupLabel}
              </span>
            </div>
            {isFree ? <SessionPricingLabel pricing="FREE" /> : null}
          </div>
          {!isFree ? <SessionPricingRow session={session} /> : null}
        </dl>
      </Link>

      {showJoin ? (
        <div className="border-t border-base-200 px-4 py-3">
          <SessionParticipateButton session={session} size="sm" />
        </div>
      ) : null}
    </article>
  )
}

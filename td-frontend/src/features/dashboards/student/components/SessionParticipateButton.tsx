import { UserPlus, Users } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  canJoinSession,
  getSeatsRemaining,
  isSessionJoined,
  joinSession,
  leaveSession,
} from '@/features/dashboards/student/lib/participation'
import type { StudentSession } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

type SessionParticipateButtonProps = {
  session: StudentSession
  size?: 'sm' | 'md'
  className?: string
}

/** Places restantes + inscription / annulation avec confirmation + toast. */
export function SessionParticipateButton({
  session,
  size = 'md',
  className,
}: SessionParticipateButtonProps) {
  const { pushToast } = useToast()
  const [joined, setJoined] = useState(() =>
    isSessionJoined(session.id, session.joined),
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!canJoinSession(session)) {
    return (
      <p className={cn('text-sm text-base-content/80', className)}>
        Inscription indisponible pour cette séance.
      </p>
    )
  }

  const remaining = getSeatsRemaining(session, joined)
  const full = remaining <= 0 && !joined

  const handleJoin = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (full) return

    joinSession(session.id)
    setJoined(true)
    pushToast({
      title: 'Inscription confirmée',
      description: `${session.subject} — ${session.chapter}`,
      tone: 'success',
    })
  }

  const openCancelConfirm = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setConfirmOpen(true)
  }

  const confirmCancel = () => {
    leaveSession(session.id)
    setJoined(false)
    setConfirmOpen(false)
    pushToast({
      title: 'Inscription annulée',
      description: `${session.subject} — ${session.chapter}`,
      tone: 'warning',
    })
  }

  return (
    <>
      <div className={cn('flex items-center justify-between gap-3', className)}>
        <div className="flex min-w-0 items-center gap-2 text-sm text-base-content/90">
          <Users className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="whitespace-nowrap">
            Places restantes{' '}
            <span
              className={cn(
                'font-bold',
                remaining <= 3 ? 'text-error' : 'text-primary',
              )}
            >
              {remaining}
            </span>
            <span className="text-base-content/70">
              {' '}
              / {session.seatsTotal}
            </span>
          </span>
        </div>

        {joined ? (
          <button
            type="button"
            onClick={openCancelConfirm}
            className="link shrink-0 min-h-11 px-1 text-sm font-medium text-error no-underline"
          >
            Annuler
          </button>
        ) : (
          <Button
            type="button"
            size={size}
            className="shrink-0 gap-2"
            disabled={full}
            onClick={handleJoin}
          >
            <UserPlus className="size-4 shrink-0" aria-hidden />
            {full ? 'Complet' : 'S’inscrire'}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Annuler l’inscription ?"
        message={`Voulez-vous vraiment annuler votre inscription à « ${session.subject} — ${session.chapter} » ?`}
        confirmLabel="Oui"
        cancelLabel="Non"
        onConfirm={confirmCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

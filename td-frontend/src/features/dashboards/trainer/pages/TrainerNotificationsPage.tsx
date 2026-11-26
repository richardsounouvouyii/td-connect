import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import { formatShortDate } from '@/features/dashboards/trainer/lib/format'
import {
  listTrainerAlerts,
  markAllTrainerAlertsRead,
  markTrainerAlertRead,
} from '@/features/dashboards/trainer/lib/trainer-alert-reads'
import type {
  TrainerNotification,
  TrainerNotificationKind,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type ReadFilter = 'ALL' | 'UNREAD' | 'READ'
type CategoryFilter = 'ALL' | 'SESSION' | 'DOCUMENT' | 'REMINDER'

function categoryOf(kind: TrainerNotificationKind): CategoryFilter {
  switch (kind) {
    case 'PROPOSAL_PENDING':
    case 'SESSION_VALIDATED':
    case 'SESSION_REFUSED':
    case 'SESSION_POSTPONED':
    case 'SESSION_CANCELLED':
    case 'NO_ENROLLMENT':
      return 'SESSION'
    case 'EXAM_MISSING':
    case 'ADMIN_PACK_READY':
      return 'DOCUMENT'
    case 'REMINDER':
      return 'REMINDER'
  }
}

function kindLabel(kind: TrainerNotificationKind): string {
  switch (kind) {
    case 'PROPOSAL_PENDING':
      return 'À valider'
    case 'SESSION_VALIDATED':
      return 'Validée'
    case 'SESSION_REFUSED':
      return 'Refusée'
    case 'SESSION_POSTPONED':
      return 'Report'
    case 'SESSION_CANCELLED':
      return 'Annulation'
    case 'EXAM_MISSING':
      return 'Documents'
    case 'ADMIN_PACK_READY':
      return 'Pack admin'
    case 'NO_ENROLLMENT':
      return 'Inscriptions'
    case 'REMINDER':
      return 'Rappel'
  }
}

function NotificationIcon({ kind }: { kind: TrainerNotificationKind }) {
  const className = 'size-4'
  switch (kind) {
    case 'EXAM_MISSING':
    case 'ADMIN_PACK_READY':
      return <BookOpen className={className} aria-hidden />
    case 'NO_ENROLLMENT':
      return <Users className={className} aria-hidden />
    case 'REMINDER':
      return <Bell className={className} aria-hidden />
    case 'PROPOSAL_PENDING':
      return <ClipboardList className={className} aria-hidden />
    default:
      return <CalendarDays className={className} aria-hidden />
  }
}

function hrefFor(notification: TrainerNotification): string | null {
  if (notification.linkedToDocuments) {
    return '/formateur/documents'
  }
  if (notification.linkedSessionId) {
    return `/formateur/seances/${notification.linkedSessionId}`
  }
  return null
}

/** Centre d’alertes formateur — propositions, docs, rappels. */
export function TrainerNotificationsPage() {
  const { pushToast } = useToast()
  const [items, setItems] = useState(listTrainerAlerts)
  const [readFilter, setReadFilter] = useState<ReadFilter>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [markAllOpen, setMarkAllOpen] = useState(false)

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  )

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (readFilter === 'UNREAD' && item.read) return false
      if (readFilter === 'READ' && !item.read) return false
      if (
        categoryFilter !== 'ALL' &&
        categoryOf(item.kind) !== categoryFilter
      ) {
        return false
      }
      return true
    })
  }, [items, readFilter, categoryFilter])

  const hasActiveFilters = readFilter !== 'ALL' || categoryFilter !== 'ALL'

  const markRead = (id: string) => {
    markTrainerAlertRead(id)
    setItems(listTrainerAlerts())
  }

  const confirmMarkAllRead = () => {
    if (unreadCount === 0) {
      setMarkAllOpen(false)
      return
    }
    const previousUnread = unreadCount
    markAllTrainerAlertsRead()
    setItems(listTrainerAlerts())
    setMarkAllOpen(false)
    pushToast({
      title: 'Tout marqué comme lu',
      description: `${previousUnread} alerte${previousUnread > 1 ? 's' : ''} mise${previousUnread > 1 ? 's' : ''} à jour.`,
      tone: 'success',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Alertes
          </h1>
          <p className="mt-1 font-sans text-base text-base-content/90">
            Propositions, packs admin, publications élèves et rappels.
            {unreadCount > 0
              ? ` ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}.`
              : ' Tout est à jour.'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-2 border-base-content/35 text-base-content shadow-none"
          disabled={unreadCount === 0}
          onClick={() => setMarkAllOpen(true)}
        >
          <CheckCheck className="size-4" aria-hidden />
          Tout marquer lu
        </Button>
      </header>

      <section
        aria-label="Filtres"
        className="rounded-xl border border-base-300 bg-white px-3 py-2.5 font-sans"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
            <span className="w-9 shrink-0 text-xs font-medium text-base-content/70">
              État
            </span>
            <FilterChip
              active={readFilter === 'ALL'}
              onClick={() => setReadFilter('ALL')}
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Toutes
            </FilterChip>
            <FilterChip
              active={readFilter === 'UNREAD'}
              onClick={() =>
                setReadFilter((current) =>
                  current === 'UNREAD' ? 'ALL' : 'UNREAD',
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Non lues
            </FilterChip>
            <FilterChip
              active={readFilter === 'READ'}
              onClick={() =>
                setReadFilter((current) =>
                  current === 'READ' ? 'ALL' : 'READ',
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Lues
            </FilterChip>
          </div>

          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
            <span className="w-9 shrink-0 text-xs font-medium text-base-content/70">
              Type
            </span>
            <FilterChip
              active={categoryFilter === 'ALL'}
              onClick={() => setCategoryFilter('ALL')}
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Tous
            </FilterChip>
            <FilterChip
              active={categoryFilter === 'SESSION'}
              onClick={() =>
                setCategoryFilter((current) =>
                  current === 'SESSION' ? 'ALL' : 'SESSION',
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Séances
            </FilterChip>
            <FilterChip
              active={categoryFilter === 'DOCUMENT'}
              onClick={() =>
                setCategoryFilter((current) =>
                  current === 'DOCUMENT' ? 'ALL' : 'DOCUMENT',
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Documents
            </FilterChip>
            <FilterChip
              active={categoryFilter === 'REMINDER'}
              onClick={() =>
                setCategoryFilter((current) =>
                  current === 'REMINDER' ? 'ALL' : 'REMINDER',
                )
              }
              className="shrink-0 px-2.5 sm:text-xs"
            >
              Rappels
            </FilterChip>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="link link-primary self-start text-xs no-underline"
              onClick={() => {
                setReadFilter('ALL')
                setCategoryFilter('ALL')
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="liste-alertes-formateur">
        <h2
          id="liste-alertes-formateur"
          className="font-display text-xl font-semibold"
        >
          Alertes ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <p className="mt-4 rounded-xl border border-base-300 bg-white px-4 py-8 text-center font-sans text-base-content/90">
            Aucune notification avec ces filtres.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {filtered.map((notification) => (
              <li key={notification.id}>
                <NotificationCard
                  notification={notification}
                  onOpen={() => {
                    if (!notification.read) markRead(notification.id)
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={markAllOpen}
        title="Tout marquer comme lu ?"
        message={
          unreadCount > 0
            ? `Toutes vos alertes non lues (${unreadCount}) seront marquées comme lues.`
            : 'Aucune alerte non lue.'
        }
        confirmLabel="Tout marquer lu"
        cancelLabel="Annuler"
        onConfirm={confirmMarkAllRead}
        onCancel={() => setMarkAllOpen(false)}
      />
    </div>
  )
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: TrainerNotification
  onOpen: () => void
}) {
  const href = hrefFor(notification)
  const isUnread = !notification.read

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              isUnread
                ? 'bg-primary/10 text-primary'
                : 'bg-base-200 text-base-content/70',
            )}
          >
            <NotificationIcon kind={notification.kind} />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                'font-display text-lg tracking-tight',
                isUnread ? 'font-semibold' : 'font-medium text-base-content/90',
              )}
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-base-content/80">
              {kindLabel(notification.kind)} ·{' '}
              {formatShortDate(notification.createdAt)}
            </p>
          </div>
        </div>

        {isUnread ? (
          <span className="badge badge-info h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none">
            Non lue
          </span>
        ) : (
          <span className="badge badge-ghost h-auto min-h-0 border-0 px-3 py-1.5 text-xs font-medium leading-none">
            Lue
          </span>
        )}
      </div>

      <p className="mt-3 font-sans text-base text-base-content/90">
        {notification.message}
      </p>

      {href ? (
        <p className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
          Voir le détail
          <ChevronRight className="size-4" aria-hidden />
        </p>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link
        to={href}
        onClick={onOpen}
        className={cn(
          'block rounded-xl border bg-white p-4 transition hover:border-primary/40',
          isUnread ? 'border-primary/30' : 'border-base-300',
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full rounded-xl border bg-white p-4 text-left transition hover:border-primary/40',
        isUnread ? 'border-primary/30' : 'border-base-300',
      )}
    >
      {content}
    </button>
  )
}

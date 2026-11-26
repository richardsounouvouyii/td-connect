import { CalendarDays, Clock3, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Time24Field } from '@/features/dashboards/trainer/components/Time24Field'
import {
  defaultRangeForWeekday,
  isValidSlotRange,
  maxTimeForWeekday,
  minTimeForWeekday,
} from '@/features/dashboards/trainer/lib/availability-rules'
import {
  AVAILABILITY_WEEKDAYS,
  TRAINER_RECURRING_SLOTS,
  WEEKDAY_LABELS,
} from '@/features/dashboards/trainer/mocks/trainer-availability'
import { PLANNING_DEMO_TODAY } from '@/features/dashboards/student/lib/planning'
import type {
  TrainerRecurringSlot,
  TrainerWeekday,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

function currentWeekLabel(anchor: Date): string {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  return `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`
}

/**
 * Programme hebdomadaire du formateur.
 * L’admin s’appuie sur ces créneaux pour proposer / afficher des séances libres.
 * Sans modification en fin de semaine, le même programme est reconduit.
 */
export function TrainerAvailabilityPage() {
  const { pushToast } = useToast()
  const [slots, setSlots] = useState(() => [...TRAINER_RECURRING_SLOTS])
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [weekday, setWeekday] = useState<TrainerWeekday>(3)
  const [startTime, setStartTime] = useState('16:00')
  const [endTime, setEndTime] = useState('19:00')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const weekLabel = currentWeekLabel(PLANNING_DEMO_TODAY)

  const sortedSlots = useMemo(
    () =>
      [...slots].sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday
        return a.startTime.localeCompare(b.startTime)
      }),
    [slots],
  )

  const activeCount = slots.filter((slot) => slot.active).length
  const slotToDelete = slots.find((slot) => slot.id === deleteId)

  const toggleSlot = (id: string) => {
    const target = slots.find((slot) => slot.id === id)
    const nextActive = !target?.active
    setSlots((current) =>
      current.map((slot) =>
        slot.id === id ? { ...slot, active: nextActive } : slot,
      ),
    )
    pushToast({
      title: nextActive ? 'Créneau activé' : 'Créneau désactivé',
      description: target
        ? `${WEEKDAY_LABELS[target.weekday]} · ${target.startTime}–${target.endTime}`
        : undefined,
      tone: 'success',
    })
  }

  const timeMin = minTimeForWeekday(weekday)
  const timeMax = maxTimeForWeekday(weekday)

  const applyWeekday = (nextDay: TrainerWeekday) => {
    setWeekday(nextDay)
    const range = defaultRangeForWeekday(nextDay)
    setStartTime(range.start)
    setEndTime(range.end)
  }

  const handleAddSlot = (event: FormEvent) => {
    event.preventDefault()
    const check = isValidSlotRange(weekday, startTime, endTime)
    if (!check.ok) {
      pushToast({
        title: 'Horaire non autorisé',
        description: check.message,
        tone: 'warning',
      })
      return
    }

    const next: TrainerRecurringSlot = {
      id: `slot-${Date.now()}`,
      weekday,
      startTime,
      endTime,
      establishmentName: 'Lycée Démo Porto-Novo',
      active: true,
    }
    setSlots((current) => [...current, next])
    setShowSlotForm(false)
    pushToast({
      title: 'Créneau ajouté au programme',
      description: `${WEEKDAY_LABELS[weekday]} · ${startTime}–${endTime}`,
      tone: 'success',
    })
  }

  const confirmDelete = () => {
    if (!deleteId) return
    setSlots((current) => current.filter((slot) => slot.id !== deleteId))
    setDeleteId(null)
    pushToast({
      title: 'Créneau retiré du programme',
      tone: 'success',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Mon programme
        </h1>
        <p className="mt-1 font-sans text-base text-base-content/90">
          Indiquez vos créneaux libres. L’administration s’en sert pour afficher
          ou valider les séances.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 font-sans">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarDays className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Semaine en cours · {weekLabel}</p>
          <p className="text-sm text-base-content/90">
            {activeCount} créneau{activeCount > 1 ? 'x' : ''} actif
            {activeCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-base-300 bg-white px-4 py-3 font-sans">
        <RefreshCw className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-base-content/90">
          <span className="font-medium text-base-content">
            Reconduction automatique :
          </span>{' '}
          si vous ne modifiez pas ce programme avant la fin de la semaine, il
          est conservé tel quel pour la semaine suivante.
        </p>
      </div>

      <section
        aria-labelledby="programme-semaine"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="programme-semaine"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Créneaux de la semaine
            </h2>
            <p className="mt-0.5 text-sm text-base-content/90">
              Mercredi 16:00–19:00 · samedi et dimanche 08:00–19:00.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => setShowSlotForm((open) => !open)}
          >
            <Plus className="size-4" aria-hidden />
            Ajouter
          </Button>
        </div>

        {showSlotForm ? (
          <form
            className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-base-200 bg-base-100/60 p-2.5"
            onSubmit={handleAddSlot}
          >
            <div>
              <label className="field-label" htmlFor="weekday">
                Jour
              </label>
              <select
                id="weekday"
                className="field-control"
                value={weekday}
                onChange={(event) =>
                  applyWeekday(Number(event.target.value) as TrainerWeekday)
                }
              >
                {AVAILABILITY_WEEKDAYS.map((day) => (
                  <option key={day} value={day}>
                    {WEEKDAY_LABELS[day]}
                  </option>
                ))}
              </select>
            </div>
            <Time24Field
              id="startTime"
              label="Début"
              value={startTime}
              minTime={timeMin}
              maxTime={timeMax}
              onChange={setStartTime}
            />
            <Time24Field
              id="endTime"
              label="Fin"
              value={endTime}
              minTime={timeMin}
              maxTime={timeMax}
              onChange={setEndTime}
            />
            <div className="col-span-3 flex flex-wrap gap-2 pt-0.5">
              <Button type="submit" size="sm">
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSlotForm(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : null}

        {sortedSlots.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-base-300 px-4 py-6 text-center text-base-content/90">
            Aucun créneau. Ajoutez votre disponibilité pour cette semaine.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {sortedSlots.map((slot) => (
              <li
                key={slot.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
                  slot.active
                    ? 'border-base-300 bg-white'
                    : 'border-base-200 bg-base-100/80 opacity-70',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock3 className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {WEEKDAY_LABELS[slot.weekday]} · {slot.startTime}–
                      {slot.endTime}
                    </p>
                    <p className="truncate text-sm text-base-content/90">
                      {slot.establishmentName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={slot.active}
                    aria-label={
                      slot.active
                        ? 'Désactiver le créneau'
                        : 'Activer le créneau'
                    }
                    onChange={() => toggleSlot(slot.id)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 min-w-9 px-0 text-error hover:bg-error/10"
                    aria-label="Retirer le créneau"
                    onClick={() => setDeleteId(slot.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Retirer ce créneau ?"
        message={
          slotToDelete
            ? `${WEEKDAY_LABELS[slotToDelete.weekday]} · ${slotToDelete.startTime}–${slotToDelete.endTime}`
            : ''
        }
        confirmLabel="Retirer"
        cancelLabel="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

import { ArrowLeft, FileCheck2, Trash2, Upload } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ChoiceToggle } from '@/features/dashboards/school-admin/components/ChoiceToggle'
import { FilterChip } from '@/features/dashboards/student/components/FilterChip'
import {
  proposeAdminSession,
  proposePublicAdminSessions,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import {
  ADMIN_CLASSES,
  ADMIN_GROUPS,
  ADMIN_TRAINERS,
  getAdminTrainerById,
  listAdminSubjects,
  listTrainersForSubjectAndClass,
} from '@/features/dashboards/school-admin/mocks/admin-catalog'
import {
  arePublicOffersAllowed,
  listManagedAdminRooms,
} from '@/features/dashboards/school-admin/mocks/admin-settings'
import {
  formatProposeDateChip,
  formatSlotHoursLabel,
  formatWeekdayLabel,
  listDatesForWeekdayInMonth,
  listTrainerIdsWithExactSlot,
  listTrainerProgrammeSlots,
  listTrainerProgrammeWeekdays,
  listTrainerSlotsForWeekday,
  listUnionProgrammeWeekdays,
  listUnionSlotsForWeekday,
} from '@/features/dashboards/school-admin/mocks/admin-trainer-availability'
import type { AdminSessionPricing } from '@/features/dashboards/school-admin/types'
import { formatFileSizeLabel } from '@/features/dashboards/trainer/lib/trainer-documents-store'
import type {
  TrainerAdminPackFile,
  TrainerDocumentKind,
  TrainerRecurringSlot,
  TrainerWeekday,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type PackMode = 'NOW' | 'LATER'
type PackDraft = {
  exam?: TrainerAdminPackFile
  correction?: TrainerAdminPackFile
}

/** Formulaire : proposition directe ou publique (premier formateur qui valide gagne). */
function resolveInitialClassLabel(raw: string | null): string {
  if (raw && (ADMIN_CLASSES as readonly string[]).includes(raw)) return raw
  return ADMIN_CLASSES[0] ?? 'Terminale D'
}

export function SchoolAdminProposeSessionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pushToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileKind, setFileKind] = useState<TrainerDocumentKind | null>(null)

  const publicOffersAllowed = arePublicOffersAllowed()
  const rooms = useMemo(() => listManagedAdminRooms(), [])
  const [isPublic, setIsPublic] = useState(false)
  const [trainerId, setTrainerId] = useState(ADMIN_TRAINERS[0]?.id ?? '')
  const [classLabel, setClassLabel] = useState(() =>
    resolveInitialClassLabel(searchParams.get('classe')),
  )
  const [subject, setSubject] = useState(
    ADMIN_TRAINERS[0]?.subjects[0] ?? 'Mathématiques',
  )

  useEffect(() => {
    if (!publicOffersAllowed && isPublic) setIsPublic(false)
  }, [publicOffersAllowed, isPublic])

  const concernedTrainers = useMemo(
    () =>
      isPublic ? listTrainersForSubjectAndClass(subject, classLabel) : [],
    [isPublic, subject, classLabel],
  )
  const concernedTrainerIds = useMemo(
    () => concernedTrainers.map((trainer) => trainer.id),
    [concernedTrainers],
  )

  const programmeSlots = useMemo(
    () => (isPublic ? [] : listTrainerProgrammeSlots(trainerId)),
    [isPublic, trainerId],
  )
  const programmeWeekdays = useMemo(
    () =>
      isPublic
        ? listUnionProgrammeWeekdays(concernedTrainerIds)
        : listTrainerProgrammeWeekdays(trainerId),
    [isPublic, concernedTrainerIds, trainerId],
  )
  const [weekday, setWeekday] = useState<TrainerWeekday | undefined>(
    programmeWeekdays[0],
  )
  const slotsForDay = useMemo(
    () =>
      weekday == null
        ? []
        : isPublic
          ? listUnionSlotsForWeekday(concernedTrainerIds, weekday)
          : listTrainerSlotsForWeekday(trainerId, weekday),
    [isPublic, concernedTrainerIds, trainerId, weekday],
  )
  const [slotId, setSlotId] = useState(slotsForDay[0]?.id ?? '')
  const selectedSlot = useMemo(
    () => slotsForDay.find((slot) => slot.id === slotId) ?? slotsForDay[0],
    [slotsForDay, slotId],
  )

  const availableTrainerIds = useMemo(() => {
    if (!isPublic || weekday == null || !selectedSlot) return []
    return listTrainerIdsWithExactSlot(
      concernedTrainerIds,
      weekday,
      selectedSlot.startTime,
      selectedSlot.endTime,
    )
  }, [isPublic, concernedTrainerIds, weekday, selectedSlot])

  const availableTrainers = useMemo(
    () =>
      availableTrainerIds
        .map((id) => getAdminTrainerById(id))
        .filter((trainer): trainer is NonNullable<typeof trainer> =>
          Boolean(trainer),
        ),
    [availableTrainerIds],
  )

  const dateOptions = useMemo(
    () => (weekday != null ? listDatesForWeekdayInMonth(weekday) : []),
    [weekday],
  )

  const [chapter, setChapter] = useState('')
  const [date, setDate] = useState(dateOptions[0] ?? '')
  const [room, setRoom] = useState(rooms[0]?.label ?? 'Salle B12')
  const [groupLabel, setGroupLabel] = useState<string>(ADMIN_GROUPS[0])
  const [pricing, setPricing] = useState<AdminSessionPricing>('PAID')
  const [priceCfa, setPriceCfa] = useState('1500')
  const [objectives, setObjectives] = useState('')
  const [proposalNote, setProposalNote] = useState('')
  const [packMode, setPackMode] = useState<PackMode>('NOW')
  const [pack, setPack] = useState<PackDraft>({})

  const trainer = useMemo(() => getAdminTrainerById(trainerId), [trainerId])
  const subjects = isPublic
    ? listAdminSubjects()
    : (trainer?.subjects ?? ['Mathématiques'])
  const startTime = selectedSlot?.startTime ?? ''
  const endTime = selectedSlot?.endTime ?? ''

  const syncScheduleForSource = (
    nextIsPublic: boolean,
    nextTrainerId: string,
    nextSubject: string,
    nextClassLabel: string = classLabel,
  ) => {
    const ids = nextIsPublic
      ? listTrainersForSubjectAndClass(nextSubject, nextClassLabel).map(
          (item) => item.id,
        )
      : [nextTrainerId]
    const days = nextIsPublic
      ? listUnionProgrammeWeekdays(ids)
      : listTrainerProgrammeWeekdays(nextTrainerId)
    const firstDay = days[0]
    if (firstDay == null) {
      setWeekday(undefined)
      setSlotId('')
      setDate('')
      return
    }
    setWeekday(firstDay)
    const daySlots = nextIsPublic
      ? listUnionSlotsForWeekday(ids, firstDay)
      : listTrainerSlotsForWeekday(nextTrainerId, firstDay)
    setSlotId(daySlots[0]?.id ?? '')
    setDate(listDatesForWeekdayInMonth(firstDay)[0] ?? '')
  }

  const applyWeekday = (nextDay: TrainerWeekday) => {
    setWeekday(nextDay)
    const daySlots = isPublic
      ? listUnionSlotsForWeekday(concernedTrainerIds, nextDay)
      : listTrainerSlotsForWeekday(trainerId, nextDay)
    setSlotId(daySlots[0]?.id ?? '')
    setDate(listDatesForWeekdayInMonth(nextDay)[0] ?? '')
  }

  const applySlot = (slot: TrainerRecurringSlot) => {
    setSlotId(slot.id)
    setWeekday(slot.weekday)
    setDate(listDatesForWeekdayInMonth(slot.weekday)[0] ?? '')
  }

  const onTrainerChange = (nextId: string) => {
    setTrainerId(nextId)
    const next = getAdminTrainerById(nextId)
    if (next?.subjects[0]) setSubject(next.subjects[0])
    syncScheduleForSource(false, nextId, next?.subjects[0] ?? subject)
    setPack({})
  }

  const onPublicToggle = (next: boolean) => {
    setIsPublic(next)
    if (next) {
      const firstSubject = listAdminSubjects()[0] ?? subject
      setSubject(firstSubject)
      syncScheduleForSource(true, trainerId, firstSubject)
    } else {
      const next = getAdminTrainerById(trainerId)
      if (next?.subjects[0]) setSubject(next.subjects[0])
      syncScheduleForSource(false, trainerId, next?.subjects[0] ?? subject)
    }
  }

  const onSubjectChange = (nextSubject: string) => {
    setSubject(nextSubject)
    if (isPublic) syncScheduleForSource(true, trainerId, nextSubject, classLabel)
  }

  const onClassChange = (nextClass: string) => {
    setClassLabel(nextClass)
    if (isPublic) syncScheduleForSource(true, trainerId, subject, nextClass)
  }

  useEffect(() => {
    if (dateOptions.length > 0 && !dateOptions.includes(date)) {
      setDate(dateOptions[0]!)
    }
  }, [dateOptions, date])

  useEffect(() => {
    if (slotsForDay.length === 0) return
    const stillValid = slotsForDay.some((slot) => slot.id === slotId)
    if (!stillValid) setSlotId(slotsForDay[0]!.id)
  }, [slotsForDay, slotId])

  const setPricingChoice = (next: AdminSessionPricing) => {
    setPricing(next)
  }

  const setPackModeChoice = (next: PackMode) => {
    setPackMode(next)
    if (next === 'LATER') setPack({})
  }

  const openPicker = (kind: TrainerDocumentKind) => {
    setFileKind(kind)
    window.setTimeout(() => fileInputRef.current?.click(), 0)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !fileKind) return
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      pushToast({
        title: 'PDF uniquement',
        description: 'Choisissez un fichier .pdf.',
        tone: 'warning',
      })
      return
    }

    const draft: TrainerAdminPackFile = {
      fileName: file.name,
      fileSizeLabel: formatFileSizeLabel(file.size || 1),
      pages: fileKind === 'EXAM' ? 4 : 3,
      providedAt: '2026-11-26',
    }
    setPack((current) =>
      fileKind === 'EXAM'
        ? { ...current, exam: draft }
        : { ...current, correction: draft },
    )
    setPackMode('NOW')
    pushToast({
      title: fileKind === 'EXAM' ? 'Épreuve cochée' : 'Corrigé coché',
      description: file.name,
      tone: 'success',
    })
    setFileKind(null)
  }

  const clearPackFile = (kind: TrainerDocumentKind) => {
    setPack((current) =>
      kind === 'EXAM'
        ? { ...current, exam: undefined }
        : { ...current, correction: undefined },
    )
    pushToast({
      title: kind === 'EXAM' ? 'Épreuve retirée' : 'Corrigé retiré',
      description: 'Le fichier n’est plus joint à la proposition.',
      tone: 'info',
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!chapter.trim()) {
      pushToast({
        title: 'Chapitre requis',
        description: 'Indiquez le chapitre de la séance.',
        tone: 'warning',
      })
      return
    }
    if (!selectedSlot || !date) {
      pushToast({
        title: 'Créneau requis',
        description: isPublic
          ? 'Choisissez un créneau commun aux formateurs concernés.'
          : 'Choisissez un créneau du programme formateur.',
        tone: 'warning',
      })
      return
    }
    if (isPublic && availableTrainerIds.length === 0) {
      pushToast({
        title: 'Aucun formateur dispos',
        description:
          'Aucun formateur de cette matière n’a ce créneau dans son programme.',
        tone: 'warning',
      })
      return
    }
    if (packMode === 'NOW' && !pack.exam && !pack.correction) {
      pushToast({
        title: 'Pack vide',
        description:
          'Ajoutez au moins un PDF, ou choisissez « Joindre plus tard ».',
        tone: 'warning',
      })
      return
    }

    const adminPack =
      packMode === 'NOW' && (pack.exam || pack.correction)
        ? { exam: pack.exam, correction: pack.correction }
        : undefined

    const shared = {
      subject,
      chapter: chapter.trim(),
      date,
      startTime,
      endTime,
      room,
      classLabel,
      groupLabel,
      pricing,
      priceCfa: pricing === 'PAID' ? Number(priceCfa) || undefined : undefined,
      objectives: objectives.trim() || undefined,
      proposalNote: proposalNote.trim() || undefined,
      adminPack,
    }

    if (isPublic) {
      const sessions = proposePublicAdminSessions({
        ...shared,
        trainerIds: availableTrainerIds,
      })
      const first = sessions[0]
      pushToast({
        title: 'Proposition publique envoyée',
        description: `${sessions.length} formateur${sessions.length > 1 ? 's' : ''} notifié${sessions.length > 1 ? 's' : ''} — le premier qui valide obtient la séance.`,
        tone: 'success',
      })
      void navigate(
        first
          ? `/admin-etablissement/planning/${first.id}`
          : '/admin-etablissement/planning',
      )
      return
    }

    const session = proposeAdminSession({
      ...shared,
      trainerId,
    })

    pushToast({
      title: 'Proposition envoyée',
      description: adminPack
        ? `${session.trainerName} validera puis pourra télécharger le pack.`
        : `${session.trainerName} peut valider — pack à joindre plus tard.`,
      tone: 'success',
    })
    void navigate(`/admin-etablissement/planning/${session.id}`)
  }

  const canSubmit = isPublic
    ? availableTrainerIds.length > 0 && Boolean(selectedSlot)
    : programmeSlots.length > 0 && Boolean(selectedSlot)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="sticky top-[3.75rem] z-20 -mx-4 -mt-5 border-b border-base-300/70 bg-base-100/95 px-4 py-1.5 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link to="/admin-etablissement/planning" className="inline-flex w-fit">
          <Button variant="ghost" className="min-h-10 gap-2 px-2">
            <ArrowLeft className="size-4" aria-hidden />
            Retour au planning
          </Button>
        </Link>
      </div>

      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Proposer une séance
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        {publicOffersAllowed ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-base-200 bg-base-200/30 px-3 py-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mt-0.5"
              checked={isPublic}
              onChange={(event) => onPublicToggle(event.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium">
                Proposition publique
              </span>
              <span className="mt-0.5 block text-xs text-base-content/70">
                Ouverte à tous les formateurs de la matière. Le premier qui
                valide obtient la séance ; les autres voient qu’ils ne peuvent
                plus valider.
              </span>
            </span>
          </label>
        ) : (
          <p
            role="status"
            className="rounded-lg border border-base-300 bg-base-200/40 px-3 py-3 text-sm text-base-content/80"
          >
            Les offres publiques sont désactivées dans{' '}
            <Link
              to="/admin-etablissement/parametres"
              className="link link-primary font-medium"
            >
              Paramètres
            </Link>
            .
          </p>
        )}

        {isPublic ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-1 font-medium">Classe</span>
                <select
                  className="select select-bordered w-full"
                  value={classLabel}
                  onChange={(event) => onClassChange(event.target.value)}
                >
                  {ADMIN_CLASSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1 font-medium">Matière</span>
                <select
                  className="select select-bordered w-full"
                  value={subject}
                  onChange={(event) => onSubjectChange(event.target.value)}
                >
                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 text-sm">
              <p className="font-medium">
                {concernedTrainers.length} formateur
                {concernedTrainers.length > 1 ? 's' : ''} concerné
                {concernedTrainers.length > 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-xs text-base-content/80">
                {concernedTrainers.map((item) => item.fullName).join(' · ') ||
                  'Aucun formateur pour cette classe et matière.'}
              </p>
              {selectedSlot ? (
                <p className="mt-2 text-xs text-base-content/90">
                  Créneau {formatSlotHoursLabel(selectedSlot)} ·{' '}
                  <span className="font-medium">
                    {availableTrainers.length} / {concernedTrainers.length}{' '}
                    dispos
                  </span>
                  {availableTrainers.length > 0
                    ? ` (${availableTrainers.map((item) => item.fullName).join(', ')})`
                    : ''}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Formateur</span>
            <select
              className="select select-bordered w-full"
              value={trainerId}
              onChange={(event) => onTrainerChange(event.target.value)}
            >
              {ADMIN_TRAINERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
          <p className="text-sm font-medium">
            {isPublic ? 'Jour (union des programmes)' : 'Jour (programme formateur)'}
          </p>
          {programmeWeekdays.length === 0 ? (
            <p className="mt-1 text-xs text-base-content/70">
              Aucun créneau déclaré — invitez les formateurs à mettre à jour
              leur programme.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-base-content/80">
                {isPublic
                  ? 'Créneaux exacts issus des programmes des formateurs concernés.'
                  : 'Comme le formateur : jour, puis créneau tel qu’il l’a défini.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {programmeWeekdays.map((day) => (
                  <FilterChip
                    key={day}
                    active={weekday === day}
                    onClick={() => applyWeekday(day)}
                  >
                    {formatWeekdayLabel(day)}
                  </FilterChip>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Heure début – fin</p>
          {slotsForDay.length === 0 ? (
            <p className="text-sm text-base-content/70">
              Aucun créneau ce jour-là.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slotsForDay.map((slot) => (
                <FilterChip
                  key={slot.id}
                  active={selectedSlot?.id === slot.id}
                  onClick={() => applySlot(slot)}
                >
                  {formatSlotHoursLabel(slot)}
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Quelle date ?</p>
          {dateOptions.length === 0 ? (
            <p className="text-sm text-base-content/70">
              Aucune date disponible ce mois-ci.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dateOptions.map((iso) => (
                <FilterChip
                  key={iso}
                  active={date === iso}
                  onClick={() => setDate(iso)}
                >
                  {formatProposeDateChip(iso)}
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        {!isPublic ? (
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Matière</span>
            <select
              className="select select-bordered w-full"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">Chapitre</span>
          <input
            className="input input-bordered w-full"
            value={chapter}
            onChange={(event) => setChapter(event.target.value)}
            placeholder="Ex. : Limites et continuité"
            required
          />
        </label>

        <div className={cn('grid gap-3', isPublic ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Salle</span>
            <select
              className="select select-bordered w-full"
              value={room}
              onChange={(event) => setRoom(event.target.value)}
            >
              {rooms.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {!isPublic ? (
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Classe</span>
              <select
                className="select select-bordered w-full"
                value={classLabel}
                onChange={(event) => setClassLabel(event.target.value)}
              >
                {ADMIN_CLASSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">Groupe</span>
            <select
              className="select select-bordered w-full"
              value={groupLabel}
              onChange={(event) => setGroupLabel(event.target.value)}
            >
              {ADMIN_GROUPS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="rounded-lg border border-base-200 p-3">
          <legend className="px-1 text-sm font-medium">Prix</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <ChoiceToggle
              className="w-auto min-w-[9rem] flex-1"
              checked={pricing === 'FREE'}
              label="Gratuit"
              onClick={() => setPricingChoice('FREE')}
            />
            <ChoiceToggle
              className="w-auto min-w-[9rem] flex-1"
              checked={pricing === 'PAID'}
              label="Payant"
              onClick={() => setPricingChoice('PAID')}
            />
          </div>
          {pricing === 'PAID' ? (
            <label className="form-control mt-3 w-full max-w-xs">
              <span className="label-text mb-1">Montant (FCFA)</span>
              <input
                type="number"
                min={0}
                className="input input-bordered w-full"
                value={priceCfa}
                onChange={(event) => setPriceCfa(event.target.value)}
              />
            </label>
          ) : null}
        </fieldset>

        <fieldset className="rounded-lg border border-base-200 p-3">
          <legend className="px-1 text-sm font-medium">
            Pack formateur (préparation)
          </legend>
          <p className="text-xs text-base-content/70">
            {isPublic
              ? 'Le formateur gagnant télécharge ces PDF après validation.'
              : 'Le formateur ne télécharge ces PDF qu’après avoir validé la séance.'}
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <ChoiceToggle
              checked={packMode === 'NOW'}
              label="Joindre maintenant"
              description="Choisir les PDF épreuve / corrigé ci-dessous."
              onClick={() => setPackModeChoice('NOW')}
            />
            <ChoiceToggle
              checked={packMode === 'LATER'}
              label="Joindre plus tard"
              description="Depuis le détail de la séance, après validation."
              onClick={() => setPackModeChoice('LATER')}
            />
          </div>

          {packMode === 'NOW' ? (
            <ul className="mt-3 flex flex-col gap-2">
              <PackFileRow
                label="Épreuve"
                file={pack.exam}
                onPick={() => openPicker('EXAM')}
                onClear={() => clearPackFile('EXAM')}
              />
              <PackFileRow
                label="Corrigé"
                file={pack.correction}
                onPick={() => openPicker('CORRECTION')}
                onClear={() => clearPackFile('CORRECTION')}
              />
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-base-300 bg-base-200/40 px-3 py-2.5 text-xs text-base-content/70">
              Ouvrez ensuite le détail de la séance → Pack formateur → Choisir
              PDF.
            </p>
          )}
        </fieldset>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">Objectifs</span>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            value={objectives}
            onChange={(event) => setObjectives(event.target.value)}
            placeholder="Optionnel"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">Note au formateur</span>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            value={proposalNote}
            onChange={(event) => setProposalNote(event.target.value)}
            placeholder="Ex. : créneau libre sur votre programme…"
          />
        </label>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" className="min-h-11" disabled={!canSubmit}>
            {isPublic
              ? `Envoyer à ${availableTrainerIds.length || '…'} formateur${availableTrainerIds.length > 1 ? 's' : ''}`
              : 'Envoyer la proposition'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            onClick={() => void navigate('/admin-etablissement/planning')}
          >
            Annuler
          </Button>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

function PackFileRow({
  label,
  file,
  onPick,
  onClear,
}: {
  label: string
  file?: TrainerAdminPackFile
  onPick: () => void
  onClear: () => void
}) {
  return (
    <li
      className={cn(
        'rounded-lg border px-3 py-2.5',
        file ? 'border-base-200' : 'border-dashed border-base-300',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileCheck2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {file ? (
            <p className="text-xs text-base-content/80">
              {file.fileName} · {file.fileSizeLabel}
            </p>
          ) : (
            <p className="text-xs text-base-content/70">Aucun fichier</p>
          )}
        </div>
        {file ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-10 gap-1.5 border-2 border-base-content/35"
              onClick={onPick}
            >
              <Upload className="size-3.5" aria-hidden />
              Remplacer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 gap-1.5 text-error"
              onClick={onClear}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Retirer
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            className="min-h-10 gap-1.5"
            onClick={onPick}
          >
            <Upload className="size-3.5" aria-hidden />
            Choisir PDF
          </Button>
        )}
      </div>
    </li>
  )
}

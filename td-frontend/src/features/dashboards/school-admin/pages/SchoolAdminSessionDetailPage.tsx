import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  Clock3,
  FileCheck2,
  MapPin,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AdminSessionStatusBadge } from '@/features/dashboards/school-admin/components/AdminSessionStatusBadge'
import { OfferKindBadge } from '@/features/dashboards/school-admin/components/OfferKindBadge'
import {
  cancelAdminSession,
  findOfferGroupBySessionId,
  getAdminSessionPack,
  postponeAdminSession,
  saveAdminSessionPack,
} from '@/features/dashboards/school-admin/lib/admin-sessions-store'
import { listAdminSessions } from '@/features/dashboards/school-admin/mocks/admin-sessions'
import {
  adminPricingLabel,
  formatAdminSessionPrice,
  formatSessionDate,
} from '@/features/dashboards/school-admin/lib/format'
import { getAdminSessionById } from '@/features/dashboards/school-admin/mocks/admin-sessions'
import { formatFileSizeLabel } from '@/features/dashboards/trainer/lib/trainer-documents-store'
import { getTrainerAdminPack } from '@/features/dashboards/trainer/mocks/trainer-admin-packs'
import type {
  TrainerAdminPack,
  TrainerAdminPackFile,
  TrainerDocumentKind,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

/** Détail séance admin — pack (joindre plus tard), report, annulation. */
export function SchoolAdminSessionDetailPage() {
  const { sessionId } = useParams()
  const { pushToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileKind, setFileKind] = useState<TrainerDocumentKind | null>(null)
  const [version, setVersion] = useState(0)
  const [postponeOpen, setPostponeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const session = useMemo(
    () => (sessionId ? getAdminSessionById(sessionId) : undefined),
    [sessionId, version],
  )

  const offerSiblings = useMemo(() => {
    void version
    if (!sessionId) return []
    const group = findOfferGroupBySessionId(sessionId)
    if (!group) return []
    return listAdminSessions().filter((item) =>
      group.sessionIds.includes(item.id),
    )
  }, [sessionId, version])

  if (!session) {
    return <Navigate to="/admin-etablissement/planning" replace />
  }

  const priceLabel = formatAdminSessionPrice(session)
  const canManage =
    session.status === 'PENDING' ||
    session.status === 'PUBLISHED' ||
    session.status === 'POSTPONED'

  const storedPack =
    getAdminSessionPack(session.id) ?? getTrainerAdminPack(session.id)
  const examFile = storedPack?.exam
  const correctionFile = storedPack?.correction
  const hasExam = Boolean(examFile) || session.hasAdminExam
  const hasCorrection = Boolean(correctionFile) || session.hasAdminCorrection
  const packIncomplete = !hasExam || !hasCorrection

  const openPicker = (kind: TrainerDocumentKind) => {
    if (!canManage) return
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
      setFileKind(null)
      return
    }

    const draft: TrainerAdminPackFile = {
      fileName: file.name,
      fileSizeLabel: formatFileSizeLabel(file.size || 1),
      pages: fileKind === 'EXAM' ? 4 : 3,
      providedAt: '2026-11-26',
    }
    const next: TrainerAdminPack = {
      exam: fileKind === 'EXAM' ? draft : examFile,
      correction: fileKind === 'CORRECTION' ? draft : correctionFile,
    }
    saveAdminSessionPack(session.id, next)
    setVersion((v) => v + 1)
    pushToast({
      title: fileKind === 'EXAM' ? 'Épreuve jointe' : 'Corrigé joint',
      description:
        'Le formateur pourra télécharger après validation de la séance.',
      tone: 'success',
    })
    setFileKind(null)
  }

  const clearPackFile = (kind: TrainerDocumentKind) => {
    if (!canManage) return
    const next: TrainerAdminPack = {
      exam: kind === 'EXAM' ? undefined : examFile,
      correction: kind === 'CORRECTION' ? undefined : correctionFile,
    }
    saveAdminSessionPack(session.id, next)
    setVersion((v) => v + 1)
    pushToast({
      title: kind === 'EXAM' ? 'Épreuve retirée' : 'Corrigé retiré',
      description: 'Le fichier n’est plus joint à cette séance.',
      tone: 'info',
    })
  }

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

      <header className="rounded-xl border border-base-300 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <OfferKindBadge
            kind={session.isPublicOffer ? 'public' : 'direct'}
          />
          <AdminSessionStatusBadge status={session.status} />
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          {session.subject}
        </h1>
        <p className="mt-1 text-base text-base-content/90">
          {session.chapter}
        </p>
        {session.isPublicOffer ? (
          <p className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-base-content/90">
            Proposition publique — le premier formateur qui valide obtient la
            séance ; les autres voient qu’ils ne peuvent plus valider.
          </p>
        ) : null}
      </header>

      {offerSiblings.length > 1 ? (
        <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Formateurs de l’offre
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {offerSiblings.map((sibling) => (
              <li
                key={sibling.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-base-200 px-3 py-2.5"
              >
                <span className="text-sm font-medium">{sibling.trainerName}</span>
                <AdminSessionStatusBadge status={sibling.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Détails
        </h2>
        <dl className="mt-3 flex flex-col gap-3">
          <DetailItem
            icon={CalendarDays}
            label="Date"
            value={`${formatSessionDate(session.date)} · ${session.startTime}–${session.endTime}`}
          />
          <DetailItem
            icon={UserRound}
            label="Formateur"
            value={session.trainerName}
          />
          <DetailItem icon={MapPin} label="Salle" value={session.room} />
          <DetailItem
            icon={Users}
            label="Classe / groupe"
            value={`${session.classLabel} · ${session.groupLabel}`}
          />
          <DetailItem
            icon={Building2}
            label="Établissement"
            value={session.establishmentName}
          />
          <DetailItem
            icon={Users}
            label="Inscriptions"
            value={`${session.seatsTaken} / ${session.seatsTotal}`}
          />
        </dl>
        {session.proposalNote ? (
          <p className="mt-4 rounded-lg border border-base-200 bg-base-200/30 px-3 py-2 text-sm">
            <span className="font-medium">Note : </span>
            {session.proposalNote}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-base-content/90">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            <span>
              Prix{' '}
              <span className="inline-flex items-center rounded-none bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
                {session.pricing === 'FREE'
                  ? 'Gratuit'
                  : (priceLabel ?? '—')}
              </span>
            </span>
          </div>
          <span
            className={
              session.pricing === 'PAID'
                ? 'inline-flex items-center rounded-none bg-success px-3 py-1.5 text-xs font-medium leading-none text-success-content'
                : 'inline-flex items-center rounded-none bg-base-300 px-3 py-1.5 text-xs font-medium leading-none text-base-content'
            }
          >
            {adminPricingLabel(session.pricing)}
          </span>
        </div>
        {session.statusNote ? (
          <p className="mt-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
            <span className="font-medium">Statut : </span>
            {session.statusNote}
          </p>
        ) : null}
        {session.objectives ? (
          <p className="mt-3 text-sm text-base-content/90">
            <span className="font-medium">Objectifs : </span>
            {session.objectives}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Pack formateur
        </h2>
        <p className="mt-1 text-sm text-base-content/80">
          PDF internes pour préparer la séance. Si vous avez choisi « Joindre
          plus tard », ajoutez-les ici. Le formateur ne télécharge qu’après
          validation.
        </p>

        {canManage && packIncomplete ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm font-medium"
          >
            Pack incomplet — joignez l’épreuve et/ou le corrigé ci-dessous.
          </p>
        ) : null}

        <ul className="mt-3 flex flex-col gap-2">
          <PackFileRow
            label="Épreuve"
            file={examFile}
            markedJoined={hasExam && !examFile}
            canEdit={canManage}
            onPick={() => openPicker('EXAM')}
            onClear={() => clearPackFile('EXAM')}
          />
          <PackFileRow
            label="Corrigé"
            file={correctionFile}
            markedJoined={hasCorrection && !correctionFile}
            canEdit={canManage}
            onPick={() => openPicker('CORRECTION')}
            onClear={() => clearPackFile('CORRECTION')}
          />
        </ul>

        <div className="mt-5 border-t border-base-200 pt-4">
          <h3 className="text-sm font-medium">Publication élèves</h3>
          <p className="mt-1 text-xs text-base-content/70">
            Gérée par le formateur dans Documents — lecture seule ici.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li className="flex items-center gap-3 border border-base-200 px-3 py-2.5 text-sm">
              <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">Épreuve élèves</span>
              {session.studentExamPublished ? (
                <span className="font-medium text-success">Publiée</span>
              ) : (
                <span className="text-base-content/70">Pas encore</span>
              )}
            </li>
            <li className="flex items-center gap-3 border border-base-200 px-3 py-2.5 text-sm">
              <FileCheck2
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span className="flex-1">Corrigé élèves</span>
              {session.studentCorrectionPublished ? (
                <span className="font-medium text-success">Publié</span>
              ) : (
                <span className="text-base-content/70">Pas encore</span>
              )}
            </li>
          </ul>
        </div>
      </section>

      {canManage ? (
        <section className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Actions
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 gap-2 border-2 border-base-content/35"
              onClick={() => setPostponeOpen(true)}
            >
              <Clock3 className="size-4" aria-hidden />
              Reporter
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 gap-2 border-2 border-error text-error"
              onClick={() => setCancelOpen(true)}
            >
              Annuler la séance
            </Button>
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={postponeOpen}
        title="Reporter cette séance ?"
        message="La séance passera en Reportée. Le formateur et les élèves en seront informés (démo)."
        confirmLabel="Reporter"
        onConfirm={() => {
          postponeAdminSession(
            session.id,
            'Report demandé par l’établissement (démo).',
          )
          setPostponeOpen(false)
          setVersion((v) => v + 1)
          pushToast({
            title: 'Séance reportée',
            description: session.chapter,
            tone: 'info',
          })
        }}
        onCancel={() => setPostponeOpen(false)}
      />

      <ConfirmDialog
        open={cancelOpen}
        title="Annuler cette séance ?"
        message="La séance sera marquée Annulée. Action démo irréversible dans cette session."
        confirmLabel="Annuler la séance"
        onConfirm={() => {
          cancelAdminSession(
            session.id,
            'Annulée par l’établissement (démo).',
          )
          setCancelOpen(false)
          setVersion((v) => v + 1)
          pushToast({
            title: 'Séance annulée',
            description: session.chapter,
            tone: 'info',
          })
        }}
        onCancel={() => setCancelOpen(false)}
      />

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
  markedJoined,
  canEdit,
  onPick,
  onClear,
}: {
  label: string
  file?: TrainerAdminPackFile
  markedJoined?: boolean
  canEdit: boolean
  onPick: () => void
  onClear: () => void
}) {
  const joined = Boolean(file) || Boolean(markedJoined)
  return (
    <li
      className={cn(
        'border px-3 py-2.5',
        joined
          ? 'border-base-200'
          : 'border-dashed border-base-300 bg-base-200/20',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <FileCheck2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {file ? (
            <p className="text-xs text-base-content/80">
              {file.fileName} · {file.fileSizeLabel}
            </p>
          ) : markedJoined ? (
            <p className="text-xs font-medium text-success">Jointe</p>
          ) : (
            <p className="text-xs text-base-content/70">
              Aucun fichier — à joindre
            </p>
          )}
        </div>
        {canEdit ? (
          file ? (
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
              {markedJoined ? 'Remplacer' : 'Choisir PDF'}
            </Button>
          )
        ) : null}
      </div>
    </li>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div>
        <dt className="text-sm text-base-content/80">{label}</dt>
        <dd className="text-base font-medium text-base-content">{value}</dd>
      </div>
    </div>
  )
}

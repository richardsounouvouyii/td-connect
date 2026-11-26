import { BookOpen, Download, FileCheck2 } from 'lucide-react'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { downloadDemoPdf } from '@/features/dashboards/student/lib/download-demo-pdf'
import { markAdminPackSeen } from '@/features/dashboards/trainer/lib/trainer-admin-pack-reads'
import { formatShortDate } from '@/features/dashboards/trainer/lib/format'
import type {
  TrainerAdminPack,
  TrainerAdminPackFile,
  TrainerDocumentKind,
} from '@/features/dashboards/trainer/types'
import { cn } from '@/lib/cn'

type AdminPrepPackBlockProps = {
  pack?: TrainerAdminPack
  /** Après validation : téléchargement ouvert. Avant : aperçu verrouillé. */
  downloadEnabled: boolean
  /** Marque le pack comme consulté au téléchargement (badge Documents). */
  sessionId?: string
  isNew?: boolean
  className?: string
}

/** Pack interne admin → formateur (préparation), hors publication élèves. */
export function AdminPrepPackBlock({
  pack,
  downloadEnabled,
  sessionId,
  isNew = false,
  className,
}: AdminPrepPackBlockProps) {
  const { pushToast } = useToast()
  const hasAny = Boolean(pack?.exam || pack?.correction)

  const handleDownload = (
    kind: TrainerDocumentKind,
    file: TrainerAdminPackFile | undefined,
  ) => {
    if (!downloadEnabled) {
      pushToast({
        title: 'Disponible après validation',
        description:
          'Validez d’abord la séance pour télécharger le pack admin.',
        tone: 'warning',
      })
      return
    }
    if (!file) {
      pushToast({
        title: kind === 'EXAM' ? 'Épreuve absente' : 'Corrigé absent',
        description: 'L’administration n’a pas encore joint ce fichier.',
        tone: 'warning',
      })
      return
    }

    const label = kind === 'EXAM' ? 'Épreuve admin' : 'Corrigé admin'
    downloadDemoPdf(file.fileName, label)
    if (sessionId) markAdminPackSeen(sessionId)
    pushToast({
      title: 'Téléchargement lancé',
      description: file.fileName,
      tone: 'success',
    })
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/20 bg-primary/5 px-3 py-3',
        isNew ? 'ring-1 ring-info/40' : undefined,
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-base-content">
          Fichiers admin (préparation)
        </p>
        {isNew ? (
          <span className="badge badge-info h-auto min-h-0 border-0 px-2.5 py-1 text-xs font-medium leading-none">
            Nouveau
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-xs text-base-content/80">
        {downloadEnabled
          ? 'Téléchargez pour lire le sujet et le corrigé avant le jour J. Pas visibles par les élèves.'
          : 'Joints par l’admin — téléchargeables dès que vous validez la séance.'}
      </p>

      {!hasAny ? (
        <p className="mt-3 rounded-lg border border-dashed border-base-300 bg-white/70 px-3 py-2.5 text-xs text-base-content/70">
          Pack pas encore fourni par l’administration.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          <AdminPackRow
            kind="EXAM"
            file={pack?.exam}
            downloadEnabled={downloadEnabled}
            onDownload={() => handleDownload('EXAM', pack?.exam)}
          />
          <AdminPackRow
            kind="CORRECTION"
            file={pack?.correction}
            downloadEnabled={downloadEnabled}
            onDownload={() => handleDownload('CORRECTION', pack?.correction)}
          />
        </ul>
      )}
    </div>
  )
}

function AdminPackRow({
  kind,
  file,
  downloadEnabled,
  onDownload,
}: {
  kind: TrainerDocumentKind
  file?: TrainerAdminPackFile
  downloadEnabled: boolean
  onDownload: () => void
}) {
  const isExam = kind === 'EXAM'
  const label = isExam ? 'Épreuve' : 'Corrigé'
  const canDownload = downloadEnabled && Boolean(file)

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-base-200 bg-white px-3 py-2.5">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          isExam ? 'bg-primary/10 text-primary' : 'bg-success/15 text-success',
        )}
      >
        {isExam ? (
          <BookOpen className="size-4" aria-hidden />
        ) : (
          <FileCheck2 className="size-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {file ? (
          <p className="text-xs text-base-content/80">
            {file.fileName} · {file.pages} p. · {file.fileSizeLabel} · joint le{' '}
            {formatShortDate(file.providedAt)}
          </p>
        ) : (
          <p className="text-xs text-base-content/70">
            Pas encore joint par l’admin
          </p>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          'min-h-10 gap-1.5 border-2 shadow-none',
          canDownload
            ? 'border-base-content/35 text-base-content'
            : 'border-base-300 bg-base-200 text-base-content/50',
        )}
        disabled={!canDownload}
        title={
          !file
            ? 'Fichier pas encore joint'
            : !downloadEnabled
              ? 'Validez d’abord la séance'
              : `Télécharger ${label.toLowerCase()}`
        }
        onClick={onDownload}
      >
        <Download className="size-3.5" aria-hidden />
        PDF
      </Button>
    </li>
  )
}

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

/** Modale de confirmation DaisyUI. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Oui',
  cancelLabel = 'Non',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <dialog className="modal modal-open" aria-labelledby="confirm-dialog-title">
      <div className="modal-box">
        <h3 id="confirm-dialog-title" className="font-display text-lg font-semibold">
          {title}
        </h3>
        <p className="mt-2 text-base text-base-content/90">{message}</p>
        <div className="modal-action">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
      <button
        type="button"
        className="modal-backdrop bg-base-content/40"
        aria-label="Fermer"
        onClick={onCancel}
      />
    </dialog>
  )
}

import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

type ToastItem = {
  id: string
  title: string
  description?: string
  tone: ToastTone
  durationMs: number
}

type PushToastOptions = {
  title: string
  description?: string
  tone?: ToastTone
  durationMs?: number
}

type ToastContextValue = {
  pushToast: (options: PushToastOptions | string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneShellClass: Record<ToastTone, string> = {
  success: 'border-success/50 bg-white text-base-content',
  error: 'border-error/50 bg-white text-base-content',
  warning: 'border-warning/60 bg-white text-base-content',
  info: 'border-info/50 bg-white text-base-content',
}

const toneIconClass: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

const toneBarTrackClass: Record<ToastTone, string> = {
  success: 'bg-success/20',
  error: 'bg-error/20',
  warning: 'bg-warning/25',
  info: 'bg-info/20',
}

const toneBarFillClass: Record<ToastTone, string> = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
}

const toneIcon = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: CircleAlert,
  info: Info,
} as const

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (options: PushToastOptions | string, toneArg?: ToastTone) => {
      const normalized =
        typeof options === 'string'
          ? { title: options, tone: toneArg ?? 'success' }
          : options

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((current) => [
        ...current,
        {
          id,
          title: normalized.title,
          description: normalized.description,
          tone: normalized.tone ?? 'success',
          durationMs: normalized.durationMs ?? 4000,
        },
      ])
    },
    [],
  )

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 top-2 z-[200] flex flex-col items-center gap-2 px-3 sm:top-3 sm:items-end sm:px-4"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <ToastCard
              key={toast.id}
              toast={toast}
              onDone={() => dismiss(toast.id)}
            />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé dans ToastProvider')
  }
  return context
}

function ToastCard({
  toast,
  onDone,
}: {
  toast: ToastItem
  onDone: () => void
}) {
  const [progress, setProgress] = useState(100)
  const Icon = toneIcon[toast.tone]

  useEffect(() => {
    const startedAt = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = now - startedAt
      const next = Math.max(0, 100 - (elapsed / toast.durationMs) * 100)
      setProgress(next)
      if (next <= 0) {
        onDone()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onDone, toast.durationMs])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border-2 px-3 pt-3 pb-3.5 shadow-xl',
        toneShellClass[toast.tone],
      )}
    >
      <div className="flex items-start gap-3 pr-7">
        <Icon
          className={cn('mt-0.5 size-5 shrink-0', toneIconClass[toast.tone])}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-base-content">
            {toast.title}
          </p>
          {toast.description ? (
            <p className="mt-0.5 text-sm leading-snug text-base-content/80">
              {toast.description}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square absolute top-2 right-2 min-h-8 min-w-8"
        aria-label="Fermer"
        onClick={onDone}
      >
        <X className="size-4" aria-hidden />
      </button>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-1.5',
          toneBarTrackClass[toast.tone],
        )}
      >
        <div
          className={cn('h-full transition-none', toneBarFillClass[toast.tone])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

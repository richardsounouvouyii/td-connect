import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'td.connect.pwaHintDismissed'

/**
 * Bannière d’installation PWA (Android/Chrome).
 * Sur iOS : message « Partager → Sur l’écran d’accueil ».
 */
export function PwaInstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [visible, setVisible] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)
    setIsIos(ios)

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    if (ios) {
      setVisible(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-[4.5rem] z-[60] px-3 lg:bottom-4">
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 shadow-lg">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Download className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold">
            Installer TD CONNECT
          </p>
          <p className="mt-0.5 text-sm text-base-content/90">
            {isIos
              ? 'Sur iPhone : Partager → Sur l’écran d’accueil.'
              : 'Ajoutez l’appli sur votre téléphone pour un accès rapide.'}
          </p>
          {!isIos && deferred ? (
            <Button size="sm" className="mt-2" onClick={() => void install()}>
              Installer
            </Button>
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm min-h-9 min-w-9"
          aria-label="Fermer"
          onClick={dismiss}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

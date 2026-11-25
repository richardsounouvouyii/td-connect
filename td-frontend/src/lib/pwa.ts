import { registerSW } from 'virtual:pwa-register'

/** Enregistre le service worker PWA (mise à jour automatique). */
export function registerPwa() {
  registerSW({
    immediate: true,
  })
}

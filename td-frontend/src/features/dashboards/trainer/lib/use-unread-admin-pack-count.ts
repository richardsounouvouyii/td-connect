import { useEffect, useState } from 'react'
import {
  getUnreadAdminPackCount,
  TRAINER_ADMIN_PACKS_CHANGED_EVENT,
} from '@/features/dashboards/trainer/lib/trainer-admin-pack-reads'

/** Compteur de packs admin non consultés (badge Documents). */
export function useUnreadAdminPackCount(): number {
  const [count, setCount] = useState(getUnreadAdminPackCount)

  useEffect(() => {
    const sync = () => setCount(getUnreadAdminPackCount())
    window.addEventListener(TRAINER_ADMIN_PACKS_CHANGED_EVENT, sync)
    return () =>
      window.removeEventListener(TRAINER_ADMIN_PACKS_CHANGED_EVENT, sync)
  }, [])

  return count
}

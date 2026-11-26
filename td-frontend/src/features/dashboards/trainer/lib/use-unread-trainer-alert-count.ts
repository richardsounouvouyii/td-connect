import { useEffect, useState } from 'react'
import {
  getUnreadTrainerAlertCount,
  TRAINER_ALERTS_CHANGED_EVENT,
} from '@/features/dashboards/trainer/lib/trainer-alert-reads'

/** Compteur d’alertes formateur non lues (Topbar / sidebar). */
export function useUnreadTrainerAlertCount(): number {
  const [count, setCount] = useState(getUnreadTrainerAlertCount)

  useEffect(() => {
    const sync = () => setCount(getUnreadTrainerAlertCount())
    window.addEventListener(TRAINER_ALERTS_CHANGED_EVENT, sync)
    return () =>
      window.removeEventListener(TRAINER_ALERTS_CHANGED_EVENT, sync)
  }, [])

  return count
}

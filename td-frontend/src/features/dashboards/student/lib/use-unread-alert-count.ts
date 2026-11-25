import { useEffect, useState } from 'react'
import {
  getUnreadAlertCount,
  STUDENT_ALERTS_CHANGED_EVENT,
} from '@/features/dashboards/student/lib/alert-reads'

/** Compteur d’alertes non lues (réactif pour la nav). */
export function useUnreadAlertCount(): number {
  const [count, setCount] = useState(getUnreadAlertCount)

  useEffect(() => {
    const sync = () => setCount(getUnreadAlertCount())
    window.addEventListener(STUDENT_ALERTS_CHANGED_EVENT, sync)
    return () => window.removeEventListener(STUDENT_ALERTS_CHANGED_EVENT, sync)
  }, [])

  return count
}

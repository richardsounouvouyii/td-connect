import { STUDENT_DOCUMENTS } from '@/features/dashboards/student/mocks/student-documents'
import { STUDENT_SESSIONS } from '@/features/dashboards/student/mocks/student-sessions'

export { STUDENT_PROFILE_DEMO } from '@/features/dashboards/student/mocks/student-profile'
export { STUDENT_RECENT_ALERTS } from '@/features/dashboards/student/mocks/student-notifications'

/** Données démo accueil élève — isolées, jamais en production. */

export const STUDENT_UPCOMING_SESSIONS = STUDENT_SESSIONS.filter(
  (session) =>
    session.status === 'PUBLISHED' || session.status === 'POSTPONED',
).slice(0, 4)

export const STUDENT_RECENT_DOCUMENTS = STUDENT_DOCUMENTS.slice(0, 4)

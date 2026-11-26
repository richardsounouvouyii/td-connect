import {
  countPendingTrainerSessions,
  upcomingTrainerSessions,
} from '@/features/dashboards/trainer/mocks/trainer-sessions'

export { TRAINER_RECENT_ALERTS } from '@/features/dashboards/trainer/mocks/trainer-notifications'
export { TRAINER_PROFILE_DEMO } from '@/features/dashboards/trainer/mocks/trainer-profile'

export const TRAINER_UPCOMING_SESSIONS = upcomingTrainerSessions().slice(0, 4)

export function getTrainerPendingCount(): number {
  return countPendingTrainerSessions()
}

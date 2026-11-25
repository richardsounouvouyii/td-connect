import { DEMO_USERS } from '@/features/auth/mocks/demo-users'
import type { AuthUser } from '@/features/auth/types'

const MOCK_SESSION_KEY = 'td.connect.mock.userId'

export function isMockAuthEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_MOCKS === 'true'
}

export function readMockSessionUser(): AuthUser | null {
  if (!isMockAuthEnabled() || typeof sessionStorage === 'undefined') {
    return null
  }

  const userId = sessionStorage.getItem(MOCK_SESSION_KEY)
  if (!userId) return null

  return DEMO_USERS.find((user) => user.id === userId) ?? null
}

export function writeMockSessionUser(user: AuthUser): void {
  if (!isMockAuthEnabled()) return
  sessionStorage.setItem(MOCK_SESSION_KEY, user.id)
}

export function clearMockSessionUser(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(MOCK_SESSION_KEY)
}

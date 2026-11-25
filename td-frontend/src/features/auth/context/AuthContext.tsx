import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { findDemoUser, MOCK_PASSWORD } from '@/features/auth/mocks/demo-users'
import {
  clearMockSessionUser,
  isMockAuthEnabled,
  readMockSessionUser,
  writeMockSessionUser,
} from '@/features/auth/lib/mock-session'
import type { AuthState, AuthUser } from '@/features/auth/types'

type LoginInput = {
  email: string
  password: string
}

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => void
  mocksEnabled: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function createInitialState(): AuthState {
  if (!isMockAuthEnabled()) {
    return { status: 'anonymous', user: null }
  }

  const user = readMockSessionUser()
  return user
    ? { status: 'authenticated', user }
    : { status: 'anonymous', user: null }
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(createInitialState)
  const mocksEnabled = isMockAuthEnabled()

  const login = useCallback(async ({ email, password }: LoginInput) => {
    if (!isMockAuthEnabled()) {
      throw new Error(
        'Connexion API non branchée. Activez VITE_ENABLE_MOCKS=true en local.',
      )
    }

    // Simule une latence réseau pour apprendre les états loading plus tard.
    await new Promise((resolve) => setTimeout(resolve, 400))

    const user = findDemoUser(email)
    if (!user || password !== MOCK_PASSWORD) {
      throw new Error('Identifiant ou mot de passe incorrect.')
    }

    writeMockSessionUser(user)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  const logout = useCallback(() => {
    clearMockSessionUser()
    setState({ status: 'anonymous', user: null })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      mocksEnabled,
    }),
    [state, login, logout, mocksEnabled],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.')
  }
  return context
}

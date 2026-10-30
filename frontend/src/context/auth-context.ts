
import { createContext } from 'react'
import type { AuthUser } from '../api/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  signIn: (user: AuthUser) => void
  signOut: () => Promise<void>
  retry: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

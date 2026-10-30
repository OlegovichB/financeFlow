
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  getCurrentUser,
  logout,
} from '../api/auth'

import type { AuthUser } from '../api/auth'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const currentUser = await getCurrentUser()

        if (active) {
          setUser(currentUser)
          setError(null)
        }
      } catch {
        if (active) {
          setError('Unable to connect to the server')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [])

  function signIn(authenticatedUser: AuthUser) {
    setUser(authenticatedUser)
    setError(null)
  }

  async function signOut() {
    await logout()
    setUser(null)
    setError(null)
  }

  async function retry() {
    setIsLoading(true)
    setError(null)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setError('Unable to connect to the server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signOut,
        retry,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

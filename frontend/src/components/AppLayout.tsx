
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { useAuth } from '../context/useAuth'
import AppNavigation from './AppNavigation'

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Unable to sign out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          {/* Logo and main navigation */}
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Link
              to="/dashboard"
              className="shrink-0 text-2xl font-bold text-violet-700"
            >
              FinanceFlow
            </Link>

            <AppNavigation />
          </div>

          {/* User, settings and logout */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="max-w-32 truncate text-sm text-slate-500"
              title={user?.name ?? 'User'}
            >
              {user?.name ?? 'User'}
            </span>

            <NavLink
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className={({ isActive }) =>
                [
                  'inline-flex h-10 w-10 shrink-0 items-center',
                  'justify-center rounded-lg transition-colors',
                  'focus-visible:outline-2',
                  'focus-visible:outline-offset-2',
                  'focus-visible:outline-violet-600',
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-violet-700',
                ].join(' ')
              }
            >
              {/* Settings gear icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.91 1.91-.06-.06A1.65 1.65 0 0 0 16 18.4a1.65 1.65 0 0 0-1 1.52V20h-2v-.08a1.65 1.65 0 0 0-1-1.52 1.65 1.65 0 0 0-1.82.33l-.06.06-1.91-1.91.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.52-1H7v-2h.08a1.65 1.65 0 0 0 1.52-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.91-1.91.06.06A1.65 1.65 0 0 0 12 7.6a1.65 1.65 0 0 0 1-1.52V6h2v.08a1.65 1.65 0 0 0 1 1.52 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.91 1.91-.06.06A1.65 1.65 0 0 0 19.4 11a1.65 1.65 0 0 0 1.52 1H21v2h-.08A1.65 1.65 0 0 0 19.4 15Z"
                  transform="translate(-1 -1)"
                />
              </svg>
            </NavLink>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
            >
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Logout errors appear on every page */}
      {logoutError && (
        <div className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {logoutError}
          </p>
        </div>
      )}

      {/* The active page is rendered here */}
      <Outlet />
    </div>
  )
}

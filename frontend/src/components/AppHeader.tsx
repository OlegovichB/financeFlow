
import { Link, NavLink } from 'react-router'
import AppNavigation from './AppNavigation'

interface AppHeaderProps {
  userName: string
  onLogout: () => void | Promise<void>
  isLoggingOut: boolean
}

export default function AppHeader({
  userName,
  onLogout,
  isLoggingOut,
}: AppHeaderProps) {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        {/* Left: logo and main navigation */}
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <Link
            to="/dashboard"
            className="shrink-0 text-2xl font-bold text-violet-700"
          >
            FinanceFlow
          </Link>

          <AppNavigation />
        </div>

        {/* Right: user controls */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="max-w-32 truncate text-sm text-slate-500">
            {userName}
          </span>

          <NavLink
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className={({ isActive }) =>
              [
                'inline-flex h-10 w-10 items-center justify-center',
                'rounded-lg transition-colors',
                'focus-visible:outline-2',
                'focus-visible:outline-violet-600',
                isActive
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-violet-700',
              ].join(' ')
            }
          >
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
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.86 1.86-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21h-2.64v-.08a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.86-1.86.06-.06A1.7 1.7 0 0 0 7.96 15a1.7 1.7 0 0 0-1.56-1H6v-2.64h.4a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.86-1.86.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V5h2.64v.4a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.86 1.86-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1H21V14h-.04A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </NavLink>

          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={isLoggingOut}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  )
}

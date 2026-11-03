
import { useState } from 'react'
import { NavLink } from 'react-router'

interface NavigationItem {
  label: string
  path: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Categories', path: '/categories' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Settings', path: '/settings' },
]

export default function AppNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const desktopLinkClass =
    'inline-flex min-h-10 items-center whitespace-nowrap ' +
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-violet-600'

  return (
    <nav
      aria-label="Main navigation"
      className="w-full min-w-0 md:w-auto"
    >
      {/* Mobile navigation */}
      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="financeflow-mobile-menu"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>Menu</span>

          <span
            aria-hidden="true"
            className="text-lg leading-none"
          >
            {isMenuOpen ? '✕' : '☰'}
          </span>
        </button>

        {isMenuOpen && (
          <div
            id="financeflow-mobile-menu"
            className="mt-2 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-4 py-3 text-sm font-medium',
                    'transition-colors',
                    'focus-visible:outline-2',
                    'focus-visible:outline-violet-600',
                    isActive
                      ? 'bg-violet-100 text-violet-800'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Desktop navigation */}
      <div className="hidden max-w-full overflow-x-auto md:block">
        <div className="flex w-max items-center gap-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  desktopLinkClass,
                  isActive
                    ? 'bg-violet-100 text-violet-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-violet-700',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

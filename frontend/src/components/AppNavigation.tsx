
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
]

export default function AppNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="max-w-full overflow-x-auto"
    >
      <div className="flex w-max items-center gap-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'inline-flex min-h-10 items-center',
                'whitespace-nowrap rounded-lg px-3 py-2',
                'text-sm font-medium transition-colors',
                'focus-visible:outline-2',
                'focus-visible:outline-offset-2',
                'focus-visible:outline-violet-600',
                isActive
                  ? 'bg-violet-100 text-violet-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-violet-700',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {isActive && (
                  <span className="sr-only">
                    {' (current page)'}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

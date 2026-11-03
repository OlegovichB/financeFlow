
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router'

import AuthProvider from './context/AuthProvider'
import { useAuth } from './context/useAuth'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import CategoriesPage from './pages/CategoriesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BudgetsPage from './pages/BudgetsPage'
import SettingsPage from './pages/SettingsPage'

function LoginRoute() {
  const { user, isLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (isLoading) {
    return <p className="p-8 text-center">Checking session...</p>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const registered = (
    location.state as { registered?: boolean } | null
  )?.registered

  return (
    <LoginPage
      successMessage={
        registered
          ? 'Account created successfully. Please sign in.'
          : undefined
      }
      onLogin={(authenticatedUser) => {
        signIn(authenticatedUser)
        navigate('/dashboard', { replace: true })
      }}
      onGoToRegister={() => navigate('/register')}
    />
  )
}

function RegisterRoute() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return <p className="p-8 text-center">Checking session...</p>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <RegisterPage
      onRegistered={() =>
        navigate('/login', {
          replace: true,
          state: { registered: true },
        })
      }
      onGoToLogin={() => navigate('/login')}
    />
  )
}

function HomeRoute() {
  const { user, isLoading, error, retry } = useAuth()

  if (isLoading) {
    return <p className="p-8 text-center">Checking session...</p>
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p role="alert">{error}</p>

        <button
          type="button"
          onClick={() => void retry()}
          className="mt-4 cursor-pointer text-violet-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <Navigate
      to={user ? '/dashboard' : '/login'}
      replace
    />
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />

          <Route path="/login" element={<LoginRoute />} />

          <Route path="/register" element={<RegisterRoute />} />

          {/* All private pages share one layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/transactions" element={<TransactionsPage />} />

              <Route path="/categories" element={<CategoriesPage />} />

              <Route path="/analytics" element={<AnalyticsPage />} />

              <Route path="/budgets" element={<BudgetsPage />} />

              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

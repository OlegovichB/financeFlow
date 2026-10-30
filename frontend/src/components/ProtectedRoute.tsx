
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute() {
  const { user, isLoading, error, retry } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Checking session...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p role="alert" className="text-rose-600">{error}</p>
        <button
          onClick={() => void retry()}
          className="rounded-lg bg-violet-700 px-5 py-2 text-white"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

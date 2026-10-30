
import { useState } from 'react'
import type { FormEvent } from 'react'

import { login } from '../api/auth'
import type { AuthUser } from '../api/auth'

interface LoginPageProps {
  onLogin: (user: AuthUser) => void
  onGoToRegister: () => void
  successMessage?: string
}

export default function LoginPage({
  onLogin,
  onGoToRegister,
  successMessage,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setIsLoading(true)

    try {
      const user = await login({
        email,
        password,
      })

      onLogin(user)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-700">
            FinanceFlow
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your finances, simplified.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="mt-2 text-center text-sm text-slate-500">
            Sign in to your account to continue
          </p>
          
          {successMessage && (
            <p
                role="status"
                className="mt-6 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
                {successMessage}
            </p>
            )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-lg bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="cursor-pointer font-semibold text-violet-700 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

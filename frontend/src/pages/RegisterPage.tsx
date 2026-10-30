
import { useState } from 'react'
import type { FormEvent } from 'react'

import { register } from '../api/auth'

interface RegisterPageProps {
  onRegistered: () => void
  onGoToLogin: () => void
}

export default function RegisterPage({
  onRegistered,
  onGoToLogin,
}: RegisterPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 12 || password.length > 64) {
      setError('Password must be 12-64 characters')
      return
    }

    setIsLoading(true)

    try {
      await register({ name, email, password })
      onRegistered()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed'
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
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Start managing your money today
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={100}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={255}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                maxLength={64}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
                placeholder="At least 12 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
                placeholder="Repeat your password"
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
              className="w-full cursor-pointer rounded-lg bg-violet-700 px-4 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-semibold text-violet-700 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

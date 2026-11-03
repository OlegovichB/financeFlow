
import { useState } from 'react'
import { Link } from 'react-router'

import AppNavigation from '../components/AppNavigation'

import {
  getAnalyticsPeriodPreference,
  isAnalyticsPeriod,
  resetAnalyticsPeriodPreference,
  saveAnalyticsPeriodPreference,
} from '../utils/preferences'

import type { AnalyticsPeriod } from '../utils/preferences'

export default function SettingsPage() {
  const [analyticsPeriod, setAnalyticsPeriod] =
    useState<AnalyticsPeriod>(getAnalyticsPeriodPreference)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handlePeriodChange(value: string) {
    const selected = Number(value)

    if (!isAnalyticsPeriod(selected)) {
      return
    }

    setMessage('')
    setError('')

    const saved = saveAnalyticsPeriodPreference(selected)

    if (!saved) {
      setError(
        'Unable to save your preference in this browser.'
      )
      return
    }

    setAnalyticsPeriod(selected)
    setMessage('Your preference has been saved.')
  }

  function handleReset() {
    setMessage('')
    setError('')

    const reset = resetAnalyticsPeriodPreference()

    if (!reset) {
      setError(
        'Unable to reset your preference in this browser.'
      )
      return
    }

    setAnalyticsPeriod(6)
    setMessage('Preferences restored to defaults.')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-4 px-4 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-6 md:py-5">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-violet-700"
          >
            FinanceFlow
          </Link>

          <AppNavigation />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Personalize your FinanceFlow experience.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Analytics Preferences
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Customize how your financial information is displayed.
            </p>
          </div>

          <div className="py-6">
            <label
              htmlFor="default-analytics-period"
              className="block font-semibold text-slate-900"
            >
              Default Analytics Period
            </label>

            <p className="mt-2 text-sm text-slate-500">
              Choose the time range shown when you open Analytics.
            </p>

            <select
              id="default-analytics-period"
              value={analyticsPeriod}
              onChange={(event) =>
                handlePeriodChange(event.target.value)
              }
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 sm:max-w-xs"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>

            <p className="mt-3 text-xs text-slate-500">
              Saved automatically in this browser.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Restore Defaults
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            About FinanceFlow
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            FinanceFlow is a personal finance application
            for tracking income, expenses, categories,
            analytics and monthly budgets.
          </p>

          <div className="mt-5 rounded-lg bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-800">
              Your financial data
            </p>

            <p className="mt-2 text-sm leading-6 text-violet-700">
              Financial records are handled by the FinanceFlow
              backend. The Analytics Period preference is stored
              only in this browser and is not synchronized
              across devices.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

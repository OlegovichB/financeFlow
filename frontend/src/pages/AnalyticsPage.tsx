
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { getTransactions } from '../api/transactions'
import type { Transaction } from '../api/transactions'

import {
  calculateAnalyticsSummary,
  calculateBarHeight,
  calculateMonthlyAnalytics,
  calculateCategorySpending,
} from '../utils/analytics'

import {
  getAnalyticsPeriodPreference,
  isAnalyticsPeriod,
  saveAnalyticsPeriodPreference,
} from '../utils/preferences'

import AppNavigation from '../components/AppNavigation'

import { formatCents } from '../utils/money'

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [monthCount, setMonthCount] = useState(
  getAnalyticsPeriodPreference
  )

  function handlePeriodChange(value: string) {
    const period = Number(value)

    if (!isAnalyticsPeriod(period)) {
      return
    }

    setMonthCount(period)
    saveAnalyticsPeriodPreference(period)
  }

  useEffect(() => {
    let cancelled = false

    async function loadTransactions() {
      try {
        const data = await getTransactions()

        if (!cancelled) {
          setTransactions(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load analytics.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTransactions()

    return () => {
      cancelled = true
    }
  }, [])

  const monthlyData = useMemo(
    () => calculateMonthlyAnalytics(transactions, monthCount),
    [transactions, monthCount]
  )

  const summary = useMemo(
    () => calculateAnalyticsSummary(monthlyData),
    [monthlyData]
  )

  const categorySpending = useMemo(
  () => calculateCategorySpending(transactions, monthlyData),
  [transactions, monthlyData]
)

  const maximum = useMemo(() => {
    return monthlyData.reduce((max, month) => {
      const larger =
        month.income > month.expenses
          ? month.income
          : month.expenses

      return larger > max ? larger : max
    }, 0n)
  }, [monthlyData])

  const cards = [
    {
      label: 'Total Income',
      amount: summary.income,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Expenses',
      amount: summary.expenses,
      color: 'text-rose-600',
    },
    {
      label: 'Net Balance',
      amount: summary.balance,
      color:
        summary.balance >= 0n
          ? 'text-violet-700'
          : 'text-rose-600',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-violet-700"
          >
            FinanceFlow
          </Link>

          <AppNavigation />

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Financial Analytics
            </h1>

            <p className="mt-2 text-slate-500">
              Understand your income and spending patterns.
            </p>
          </div>

          <div>
            <label
              htmlFor="analytics-period"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Period
            </label>

            <select
              id="analytics-period"
              value={monthCount}
              onChange={(event) =>
                handlePeriodChange(event.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-600"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-center text-slate-500">
            Loading analytics...
          </p>
        ) : error ? (
          <p className="text-center text-slate-500">
            Analytics could not be loaded.
          </p>
        ) : (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>

                  <p
                    className={`mt-3 text-3xl font-bold ${card.color}`}
                  >
                    {formatCents(card.amount)}
                  </p>
                </div>
              ))}
            </div>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Income vs Expenses
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Monthly financial comparison
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-500" />
                    Income
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-violet-500" />
                    Expenses
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {monthlyData.map((month) => {
                  const incomeHeight = calculateBarHeight(
                    month.income,
                    maximum
                  )

                  const expenseHeight = calculateBarHeight(
                    month.expenses,
                    maximum
                  )

                  return (
                    <div
                      key={month.month}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex h-40 items-end justify-center gap-3">
                        <div className="flex h-full w-12 items-end">
                          <div
                            title={`Income: ${formatCents(month.income)}`}
                            className="w-full rounded-t-md bg-emerald-500"
                            style={{
                              height: `${incomeHeight}%`,
                            }}
                          />
                        </div>

                        <div className="flex h-full w-12 items-end">
                          <div
                            title={`Expenses: ${formatCents(month.expenses)}`}
                            className="w-full rounded-t-md bg-violet-500"
                            style={{
                              height: `${expenseHeight}%`,
                            }}
                          />
                        </div>
                      </div>

                      <p className="mt-3 text-center text-sm font-semibold text-slate-800">
                        {month.label}
                      </p>

                      <div className="mt-3 space-y-1 text-xs">
                        <p className="text-emerald-700">
                          + {formatCents(month.income)}
                        </p>

                        <p className="text-violet-700">
                          - {formatCents(month.expenses)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-900">
                  Monthly Breakdown
                </h2>

                
            {/* Spending by Category */}
            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                <h2 className="text-xl font-semibold text-slate-900">
                    Spending by Category
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    See where your money goes during the selected period.
                </p>
                </div>

                <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500">
                    Total Expenses
                </p>

                <p className="mt-1 text-2xl font-bold text-violet-700">
                    {formatCents(summary.expenses)}
                </p>
                </div>
            </div>

            {categorySpending.length === 0 ? (
                <div className="rounded-lg bg-slate-50 px-6 py-12 text-center">
                <p className="font-medium text-slate-700">
                    No expenses in this period
                </p>

                <p className="mt-2 text-sm text-slate-500">
                    Add an expense transaction to see category analytics.
                </p>
                </div>
            ) : (
                <div className="space-y-6">
                {categorySpending.map((item) => (
                    <div key={item.category} className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                        <h3 className="font-semibold text-slate-900">
                            {item.category}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            {item.transactionCount}{' '}
                            {item.transactionCount === 1
                            ? 'transaction'
                            : 'transactions'}
                        </p>
                        </div>

                        <div className="text-right">
                        <p className="font-semibold text-slate-900">
                            {formatCents(item.total)}
                        </p>

                        <p className="mt-1 text-sm text-violet-700">
                            {item.percentage.toFixed(2)}%
                        </p>
                        </div>
                    </div>

                    <div
                        role="progressbar"
                        aria-label={`${item.category} spending percentage`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={item.percentage}
                        className="h-3 overflow-hidden rounded-full bg-slate-100"
                    >
                        <div
                        className="h-full rounded-full bg-violet-600 transition-all duration-300"
                        style={{
                            width: `${item.percentage}%`,
                        }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            )}
            </section>


                <p className="mt-1 text-sm text-slate-500">
                  {summary.transactionCount} transactions in selected period
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4">Income</th>
                      <th className="px-6 py-4">Expenses</th>
                      <th className="px-6 py-4">Balance</th>
                      <th className="px-6 py-4">Transactions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {monthlyData.map((month) => (
                      <tr key={month.month}>
                        <td className="px-6 py-4 font-medium">
                          {month.label}
                        </td>

                        <td className="px-6 py-4 text-emerald-700">
                          {formatCents(month.income)}
                        </td>

                        <td className="px-6 py-4 text-rose-600">
                          {formatCents(month.expenses)}
                        </td>

                        <td
                          className={`px-6 py-4 font-semibold ${
                            month.balance >= 0n
                              ? 'text-slate-900'
                              : 'text-rose-600'
                          }`}
                        >
                          {formatCents(month.balance)}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {month.transactionCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

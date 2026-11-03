
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import {
  formatCents,
  formatMoney,
  toCents,
} from '../utils/money'

import { getTransactions } from '../api/transactions'
import type { Transaction } from '../api/transactions'

import { useAuth } from '../context/useAuth'


function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
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
              : 'Unable to load dashboard'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    async function checkBackend() {
      try {
        const response = await fetch('/api/v1/health')

        if (!response.ok) {
          throw new Error('Backend unavailable')
        }

        const data: { status: string } = await response.json()

        if (!cancelled) {
          setApiStatus(
            data.status === 'UP' ? 'Connected' : 'Unavailable'
          )
        }
      } catch {
        if (!cancelled) {
          setApiStatus('Disconnected')
        }
      }
    }

    void loadDashboard()
    void checkBackend()

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    let income = 0n
    let expenses = 0n

    for (const transaction of transactions) {
      const amount = toCents(transaction.amount)

      if (transaction.type === 'INCOME') {
        income += amount
      } else {
        expenses += amount
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }, [transactions])


  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateComparison =
          b.transactionDate.localeCompare(a.transactionDate)

        return dateComparison !== 0
          ? dateComparison
          : b.id - a.id
      })
      .slice(0, 5)
  }, [transactions])

  

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-3 text-slate-500">
            Welcome back, {user?.name ?? 'User'}!
            Here's your financial overview.
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Backend API: {apiStatus}
          </p>
        </section>

        {isLoading ? (
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500"
          >
            Loading your financial overview...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-white p-10 text-center">
            <p role="alert" className="text-rose-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 cursor-pointer font-medium text-violet-700 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section
              aria-label="Financial summary"
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Income
                </p>

                <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                  {formatCents(summary.income)}
                </h2>
              </article>

              <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Expenses
                </p>

                <h2 className="mt-3 text-3xl font-bold text-rose-600">
                  {formatCents(summary.expenses)}
                </h2>
              </article>

              <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Net Balance
                </p>

                <h2
                  className={`mt-3 text-3xl font-bold ${
                    summary.balance >= 0n
                      ? 'text-violet-700'
                      : 'text-rose-600'
                  }`}
                >
                  {formatCents(summary.balance)}
                </h2>
              </article>
            </section>

            <section className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Transactions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest financial activity
                  </p>
                </div>

                <Link
                  to="/transactions"
                  className="text-sm font-semibold text-violet-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <h3 className="text-lg font-medium text-slate-800">
                    No transactions yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Add your first income or expense to get started.
                  </p>

                  <Link
                    to="/transactions"
                    className="mt-5 inline-block rounded-lg bg-violet-700 px-5 py-3 font-medium text-white hover:bg-violet-800"
                  >
                    Add Transaction
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentTransactions.map((transaction) => {
                    const isIncome =
                      transaction.type === 'INCOME'

                    return (
                      <li
                        key={transaction.id}
                        className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isIncome ? '↙' : '↗'}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {transaction.category}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {transaction.description ||
                                'No description'}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(transaction.transactionDate)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              isIncome
                                ? 'text-emerald-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? '+' : '−'}
                            {formatMoney(transaction.amount)}
                          </p>

                          <span className="text-xs text-slate-500">
                            {transaction.type}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

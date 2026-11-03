
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from '../api/budgets'

import type { Budget } from '../api/budgets'

import { getCategories as getSavedCategories } from '../api/categories'
import type { Category } from '../api/categories'

import { getTransactions } from '../api/transactions'
import type { Transaction } from '../api/transactions'

import { getCategories as getDefaultCategories } from '../constants/categories'

import {
  calculateBudgetProgress,
  calculateBudgetSummary,
  getProgressBarWidth,
} from '../utils/budgetProgress'

import { formatCents, toCents } from '../utils/money'

function getCurrentMonth(): string {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function toBackendMonth(month: string): string {
  return `${month}-01`
}

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)

  return new Intl.DateTimeFormat('en-SG', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthNumber - 1, 1))
}

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savedCategories, setSavedCategories] = useState<Category[]>([])

  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [transactionsError, setTransactionsError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  // Load saved categories
  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const data = await getSavedCategories()

        if (!cancelled) {
          setSavedCategories(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load saved categories.'
          )
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  // Load budgets for selected month
  useEffect(() => {
    let cancelled = false

    async function loadBudgets() {
      setIsLoading(true)

      try {
        const data = await getBudgets(
          toBackendMonth(selectedMonth)
        )

        if (!cancelled) {
          setBudgets(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load budgets.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadBudgets()

    return () => {
      cancelled = true
    }
  }, [selectedMonth])

  // Load all transactions once when page opens
  useEffect(() => {
    let cancelled = false

    async function loadTransactions() {
      setIsLoadingTransactions(true)
      setTransactionsError('')

      try {
        const data = await getTransactions()

        if (!cancelled) {
          setTransactions(data)
        }
      } catch (err) {
        if (!cancelled) {
          setTransactionsError(
            err instanceof Error
              ? err.message
              : 'Unable to load spending data.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTransactions(false)
        }
      }
    }

    void loadTransactions()

    return () => {
      cancelled = true
    }
  }, [])

  // Combine default and saved expense categories
  const availableCategories = useMemo(() => {
    const defaults = getDefaultCategories('EXPENSE')

    const custom = savedCategories
      .filter((item) => item.type === 'EXPENSE')
      .map((item) => item.name)

    const unique = new Map<string, string>()

    for (const name of [...defaults, ...custom]) {
      const key = name.trim().toLowerCase()

      if (!unique.has(key)) {
        unique.set(key, name)
      }
    }

    return Array.from(unique.values()).sort((a, b) =>
      a.localeCompare(b)
    )
  }, [savedCategories])

  // Financial progress for every budget
  const budgetProgress = useMemo(
    () =>
      calculateBudgetProgress(
        budgets,
        transactions,
        selectedMonth
      ),
    [budgets, transactions, selectedMonth]
  )

  // Summary for all budgeted categories
  const budgetSummary = useMemo(
    () => calculateBudgetSummary(budgetProgress),
    [budgetProgress]
  )

  const usedCategories = useMemo(
    () =>
      new Set(
        budgets.map((budget) =>
          budget.category.trim().toLowerCase()
        )
      ),
    [budgets]
  )

  const isBusy = isSaving || deletingId !== null

  function handleMonthChange(value: string) {
    if (!value || isBusy) return

    setSelectedMonth(value)
    setIsLoading(true)
    setBudgets([])
    setEditingBudget(null)
    setCategory('')
    setAmount('')
    setFormError('')
    setError('')
    setSuccess('')
  }

  function startEditing(budget: Budget) {
    setEditingBudget(budget)
    setCategory(budget.category)
    setAmount(budget.amount)
    setFormError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function resetForm() {
    setEditingBudget(null)
    setCategory('')
    setAmount('')
    setFormError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError('')
    setSuccess('')

    if (!category.trim()) {
      setFormError('Please select a category.')
      return
    }

    const normalizedAmount = amount.trim()

    let amountInCents: bigint

    try {
      amountInCents = toCents(normalizedAmount)
    } catch {
      setFormError(
        'Enter a valid amount with up to two decimal places.'
      )
      return
    }

    if (amountInCents <= 0n) {
      setFormError('Budget must be greater than zero.')
      return
    }

    const request = {
      category: category.trim(),
      month: toBackendMonth(selectedMonth),
      amount: normalizedAmount,
    }

    setIsSaving(true)

    try {
      if (editingBudget) {
        const updated = await updateBudget(
          editingBudget.id,
          request
        )

        setBudgets((previous) =>
          previous.map((item) =>
            item.id === updated.id ? updated : item
          )
        )

        setSuccess('Budget updated successfully.')
      } else {
        const created = await createBudget(request)

        setBudgets((previous) => [...previous, created])

        setSuccess('Budget created successfully.')
      }

      resetForm()
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Unable to save budget.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(budget: Budget) {
    const confirmed = window.confirm(
      `Delete the ${budget.category} budget for ${formatMonth(selectedMonth)}?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')
    setDeletingId(budget.id)

    try {
      await deleteBudget(budget.id)

      setBudgets((previous) =>
        previous.filter((item) => item.id !== budget.id)
      )

      if (editingBudget?.id === budget.id) {
        resetForm()
      }

      setSuccess('Budget deleted successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete budget.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 ' +
    'outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100'

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Page heading and month selector */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Monthly Budgets
            </h1>

            <p className="mt-2 text-slate-500">
              Plan and track your spending by category.
            </p>
          </div>

          <div>
            <label
              htmlFor="budget-month"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Month
            </label>

            <input
              id="budget-month"
              type="month"
              value={selectedMonth}
              onChange={(event) =>
                handleMonthChange(event.target.value)
              }
              disabled={isBusy}
              className={inputClass}
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </p>
        )}

        {/* Budget summary */}
        {isLoading || isLoadingTransactions ? (
          <p className="mb-8 text-sm text-slate-500">
            Loading budget statistics...
          </p>
        ) : transactionsError ? (
          <p
            role="alert"
            className="mb-8 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            Spending statistics unavailable: {transactionsError}
          </p>
        ) : !error ? (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Budget
              </p>
              <p className="mt-3 text-lg font-bold break-all sm:text-2xl text-violet-700">
                {formatCents(budgetSummary.totalLimit)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Spent
              </p>
              <p className="mt-3 text-lg font-bold break-all sm:text-2xl text-rose-600">
                {formatCents(budgetSummary.totalSpent)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Remaining
              </p>
              <p
                className={`mt-3 text-lg font-bold break-all sm:text-2xl ${
                  budgetSummary.totalRemaining >= 0n
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {formatCents(budgetSummary.totalRemaining)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Over Budget
              </p>
              <p
                className={`mt-3 text-lg font-bold break-all sm:text-2xl ${
                  budgetSummary.exceededCount > 0
                    ? 'text-rose-600'
                    : 'text-slate-900'
                }`}
              >
                {budgetSummary.exceededCount}
              </p>
            </div>
          </div>
        ) : null}

        {/* Create / Edit Budget */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {formatMonth(selectedMonth)}
          </p>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-6 grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="budget-category"
                className="mb-2 block text-sm font-medium"
              >
                Expense Category
              </label>

              <select
                id="budget-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isBusy || isLoading || Boolean(editingBudget)}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select category
                </option>

                {editingBudget &&
                  !availableCategories.includes(editingBudget.category) && (
                    <option value={editingBudget.category}>
                      {editingBudget.category}
                    </option>
                  )}

                {availableCategories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    disabled={
                      !editingBudget &&
                      usedCategories.has(item.toLowerCase())
                    }
                  >
                    {item}
                    {!editingBudget &&
                    usedCategories.has(item.toLowerCase())
                      ? ' (Already budgeted)'
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="budget-amount"
                className="mb-2 block text-sm font-medium"
              >
                Monthly Limit (SGD)
              </label>

              <input
                id="budget-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500.00"
                required
                disabled={isBusy || isLoading}
                className={inputClass}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="text-sm text-rose-600 sm:col-span-2"
              >
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={isBusy || isLoading}
                className="cursor-pointer rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
              >
                {isSaving
                  ? 'Saving...'
                  : editingBudget
                    ? 'Update Budget'
                    : 'Create Budget'}
              </button>

              {editingBudget && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isBusy}
                  className="cursor-pointer rounded-lg border border-slate-300 px-6 py-3 text-slate-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Budget List with Spending Progress */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Budgets for {formatMonth(selectedMonth)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your spending limits and progress.
            </p>
          </div>

          {isLoading || isLoadingTransactions ? (
            <p className="p-10 text-center text-slate-500">
              Loading budgets and spending...
            </p>
          ) : error ? (
            <p className="p-10 text-center text-rose-600">
              Unable to load budgets.
            </p>
          ) : transactionsError ? (
            <p className="p-10 text-center text-rose-600">
              Unable to calculate spending: {transactionsError}
            </p>
          ) : budgets.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                No budgets for this month
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create your first budget using the form above.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {budgetProgress.map((item) => {
                const budget = item.budget

                const isExceeded = item.status === 'EXCEEDED'
                const isWarning = item.status === 'WARNING'

                const progressColor = isExceeded
                  ? 'bg-rose-500'
                  : isWarning
                    ? 'bg-amber-500'
                    : 'bg-violet-600'

                const statusText = isExceeded
                  ? 'Over Budget'
                  : isWarning
                    ? 'Near Limit'
                    : 'On Track'

                const statusColor = isExceeded
                  ? 'text-rose-700 bg-rose-50'
                  : isWarning
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-emerald-700 bg-emerald-50'

                return (
                  <li key={budget.id} className="px-6 py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {budget.category}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.transactionCount}{' '}
                          {item.transactionCount === 1
                            ? 'transaction'
                            : 'transactions'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                        >
                          {statusText}
                        </span>

                        <button
                          type="button"
                          onClick={() => startEditing(budget)}
                          disabled={isBusy}
                          className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(budget)}
                          disabled={isBusy}
                          className="cursor-pointer rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {deletingId === budget.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* Financial Values */}
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          Spent
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {formatCents(item.spent)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Monthly Limit
                        </p>

                        <p className="mt-1 text-xl font-bold text-violet-700">
                          {formatCents(item.limit)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      role="progressbar"
                      aria-label={`${budget.category} budget usage`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={getProgressBarWidth(item.percentage)}
                      aria-valuetext={`${item.percentage.toFixed(2)} percent of budget used`}
                      className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{
                          width: `${getProgressBarWidth(item.percentage)}%`,
                        }}
                      />
                    </div>

                    {/* Remaining Amount */}
                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-slate-500">
                        {item.percentage.toFixed(2)}% used
                      </span>

                      <span
                        className={
                          isExceeded
                            ? 'font-semibold text-rose-600'
                            : 'font-medium text-slate-600'
                        }
                      >
                        {isExceeded
                          ? `${formatCents(-item.remaining)} over budget`
                          : `${formatCents(item.remaining)} remaining`}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

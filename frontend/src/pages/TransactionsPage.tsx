
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'


import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../api/transactions'

import AppNavigation from '../components/AppNavigation'

import type {
  Transaction,
  TransactionRequest,
} from '../api/transactions'

import TransactionForm from '../components/TransactionForm'
import { formatMoney } from '../utils/money'
import {
  DEFAULT_TRANSACTION_FILTERS,
  filterAndSortTransactions,
  getTransactionCategories,
} from '../utils/transactionFilters'
import type { TransactionFilters } from '../utils/transactionFilters'

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default function TransactionsPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [filters, setFilters] = useState<TransactionFilters>(
    DEFAULT_TRANSACTION_FILTERS
  )

  const availableCategories = useMemo(
    () => getTransactionCategories(transactions),
    [transactions]
  )

  const visibleTransactions = useMemo(
    () => filterAndSortTransactions(transactions, filters),
    [transactions, filters]
  )

  const invalidDateRange = Boolean(
    filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo
  )

  const activeFilters = Boolean(
    filters.search ||
    filters.type !== 'ALL' ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sort !== 'NEWEST'
  )

  function updateFilter<K extends keyof TransactionFilters>(
    name: K,
    value: TransactionFilters[K]
  ) {
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  async function refreshTransactions() {
    setIsLoading(true)
    setError('')

    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load transactions'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialTransactions() {
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
              : 'Unable to load transactions'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialTransactions()

    return () => {
      cancelled = true
    }
  }, [])

  function startAdding() {
    setEditingTransaction(null)
    setActionError('')
    setShowForm(true)
  }

  useEffect(() => {
  if (showForm) {
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}, [showForm, editingTransaction])

  function startEditing(transaction: Transaction) {
    setEditingTransaction(transaction)
    setActionError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTransaction(null)
  }

  async function handleSave(data: TransactionRequest) {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
    } else {
      await createTransaction(data)
    }

    closeForm()
    await refreshTransactions()
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Delete the ${transaction.category} transaction?`
    )

    if (!confirmed) {
      return
    }

    setActionError('')
    setIsDeleting(true)

    try {
      await deleteTransaction(transaction.id)
      await refreshTransactions()
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to delete transaction'
      )
    } finally {
      setIsDeleting(false)
    }
  }

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
              Transactions
            </h1>
            <p className="mt-2 text-slate-500">
              Track your income and expenses.
            </p>
          </div>

          <button
            type="button"
            onClick={showForm ? closeForm : startAdding}
            className="cursor-pointer rounded-lg bg-violet-700 px-5 py-3 font-medium text-white hover:bg-violet-800"
          >
            {showForm ? 'Close Form' : '+ Add Transaction'}
          </button>
        </div>

        {showForm && (
          <div ref={formRef} className="mb-8 scroll-mt-6">
            <TransactionForm
              key={editingTransaction?.id ?? 'new'}
              transaction={editingTransaction}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </div>
        )}

        {actionError && (
          <p role="alert" className="mb-5 text-sm text-rose-600">
            {actionError}
          </p>
        )}

        <section
          aria-label="Filter transactions"
          className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Filter Transactions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by category or description and narrow down the results.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_TRANSACTION_FILTERS)}
              disabled={!activeFilters}
              className="cursor-pointer text-sm font-medium text-violet-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="filter-search" className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>
              <input
                id="filter-search"
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="e.g. groceries, salary..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="filter-type" className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                id="filter-type"
                value={filters.type}
                onChange={(event) => updateFilter('type', event.target.value as TransactionFilters['type'])}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              >
                <option value="ALL">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-category" className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(event) => updateFilter('category', event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">All categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-from" className="mb-2 block text-sm font-medium text-slate-700">
                From date
              </label>
              <input
                id="filter-from"
                type="date"
                value={filters.dateFrom}
                onChange={(event) => updateFilter('dateFrom', event.target.value)}
                aria-invalid={invalidDateRange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="filter-to" className="mb-2 block text-sm font-medium text-slate-700">
                To date
              </label>
              <input
                id="filter-to"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(event) => updateFilter('dateTo', event.target.value)}
                aria-invalid={invalidDateRange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="filter-sort" className="mb-2 block text-sm font-medium text-slate-700">
                Sort by
              </label>
              <select
                id="filter-sort"
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value as TransactionFilters['sort'])}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              >
                <option value="NEWEST">Newest first</option>
                <option value="OLDEST">Oldest first</option>
                <option value="AMOUNT_HIGH">Highest amount</option>
                <option value="AMOUNT_LOW">Lowest amount</option>
              </select>
            </div>
          </div>

          {invalidDateRange && (
            <p role="alert" className="mt-4 text-sm text-rose-600">
              From date cannot be later than To date.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              All Transactions
            </h2>

            {!isLoading && !error && (
              <span className="text-sm text-slate-500">
                Showing {visibleTransactions.length} of {transactions.length} transactions
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="p-10 text-center text-slate-500">
              Loading transactions...
            </p>
          ) : error ? (
            <div className="p-10 text-center">
              <p role="alert" className="text-rose-600">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void refreshTransactions()}
                className="mt-4 cursor-pointer font-medium text-violet-700 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No transactions yet
              </h3>
              <p className="mt-2 text-slate-500">
                Click Add Transaction to get started.
              </p>
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No matching transactions
              </h3>
              <p className="mt-2 text-slate-500">
                Try changing or clearing your filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_TRANSACTION_FILTERS)}
                className="mt-4 cursor-pointer font-medium text-violet-700 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visibleTransactions.map((transaction) => {
                const isIncome = transaction.type === 'INCOME'

                return (
                  <li
                    key={transaction.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50"
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
                          {transaction.description || 'No description'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(transaction.transactionDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
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
                        <span className="text-xs font-medium text-slate-500">
                          {transaction.type}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(transaction)}
                          disabled={isDeleting}
                          className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm text-violet-700 hover:bg-violet-50 disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(transaction)}
                          disabled={isDeleting}
                          className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
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

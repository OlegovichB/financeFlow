
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../api/transactions'

import type {
  Transaction,
  TransactionRequest,
} from '../api/transactions'

import TransactionForm from '../components/TransactionForm'
import { formatMoney } from '../utils/money'

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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

          <nav className="flex gap-5 text-sm font-medium">
            <Link
              to="/dashboard"
              className="text-slate-600 hover:text-violet-700"
            >
              Dashboard
            </Link>

            <Link
              to="/transactions"
              aria-current="page"
              className="text-violet-700"
            >
              Transactions
            </Link>
          </nav>
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
          <div className="mb-8">
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

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              All Transactions
            </h2>

            {!isLoading && !error && (
              <span className="text-sm text-slate-500">
                {transactions.length} transactions
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
          ) : (
            <ul className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
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

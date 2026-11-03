
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { Link } from 'react-router'

import {
  createCategory,
  deleteCategory,
  getCategories,
} from '../api/categories'

import type { Category } from '../api/categories'
import type { TransactionType } from '../api/transactions'

import {
  getCategories as getDefaultCategories,
} from '../constants/categories'

export default function CategoriesPage() {
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const data = await getCategories()

        if (!cancelled) {
          setCategories(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load categories.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  const defaultCategories = getDefaultCategories(type)

  const customCategories = useMemo(
    () =>
      categories
        .filter((category) => category.type === type)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, type]
  )

  const isBusy = isCreating || deletingId !== null

  function changeType(nextType: TransactionType) {
    setType(nextType)
    setError('')
    setSuccess('')
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const normalizedName = name.trim()

    if (!normalizedName) {
      setError('Please enter a category name.')
      return
    }

    if (normalizedName.length > 100) {
      setError('Category name must be at most 100 characters.')
      return
    }

    const alreadyExists = [
      ...defaultCategories,
      ...customCategories.map((category) => category.name),
    ].some(
      (item) =>
        item.toLowerCase() === normalizedName.toLowerCase()
    )

    if (alreadyExists) {
      setError('This category already exists.')
      return
    }

    setIsCreating(true)

    try {
      const created = await createCategory({
        name: normalizedName,
        type,
      })

      setCategories((previous) => [...previous, created])
      setName('')
      setSuccess(`Category "${created.name}" created successfully.`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create category.'
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nExisting transactions will not be deleted.`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')
    setDeletingId(category.id)

    try {
      await deleteCategory(category.id)

      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id)
      )

      setSuccess(`Category "${category.name}" deleted successfully.`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete category.'
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
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-violet-700"
          >
            FinanceFlow
          </Link>

          <nav className="flex flex-wrap gap-5 text-sm font-medium">
            <Link
              to="/dashboard"
              className="text-slate-600 hover:text-violet-700"
            >
              Dashboard
            </Link>

            <Link
              to="/transactions"
              className="text-slate-600 hover:text-violet-700"
            >
              Transactions
            </Link>

            <Link
              to="/categories"
              aria-current="page"
              className="text-violet-700"
            >
              Categories
            </Link>

            <Link
              to="/budgets"
              className="text-slate-600 hover:text-violet-700"
            >
              Budgets
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Categories
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your income and expense categories.
          </p>
        </div>

        {/* Type Switcher */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(['EXPENSE', 'INCOME'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeType(option)}
              aria-pressed={type === option}
              className={`cursor-pointer rounded-lg border px-5 py-3 font-medium transition ${
                type === option
                  ? 'border-violet-700 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option === 'EXPENSE' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </p>
        )}

        {/* Add Category */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Add Custom Category
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create a category for your {type.toLowerCase()} transactions.
          </p>

          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1">
              <label htmlFor="category-name" className="sr-only">
                Category name
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Gym"
                maxLength={100}
                required
                disabled={isBusy || isLoading}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isBusy || isLoading || !name.trim()}
              className="cursor-pointer rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? 'Adding...' : '+ Add Category'}
            </button>
          </form>
        </section>

        {/* Saved Categories */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              My Custom Categories
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {customCategories.length} saved categories
            </p>
          </div>

          {isLoading ? (
            <p className="p-8 text-center text-slate-500">
              Loading categories...
            </p>
          ) : customCategories.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No custom categories yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {customCategories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <span className="font-medium text-slate-900">
                    {category.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleDelete(category)}
                    disabled={isBusy}
                    className="cursor-pointer rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    {deletingId === category.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Default Categories */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Default Categories
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Built-in categories cannot be deleted.
            </p>
          </div>

          <ul className="divide-y divide-slate-100">
            {defaultCategories.map((category) => (
              <li
                key={category}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <span className="font-medium text-slate-700">
                  {category}
                </span>

                <span className="text-xs text-slate-400">
                  Default
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

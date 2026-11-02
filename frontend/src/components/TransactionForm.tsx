
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import {
  createCategory,
  getCategories,
} from '../api/categories'

import type { Category } from '../api/categories'

import type {
  Transaction,
  TransactionRequest,
  TransactionType,
} from '../api/transactions'

import { getCategories as getDefaultCategories } from '../constants/categories'
import { toCents } from '../utils/money'

interface TransactionFormProps {
  transaction?: Transaction | null
  onSave: (data: TransactionRequest) => Promise<void>
  onCancel: () => void
}

function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function TransactionForm({
  transaction,
  onSave,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? 'EXPENSE'
  )

  const [amount, setAmount] = useState(
    transaction?.amount ?? ''
  )

  const [category, setCategory] = useState(
    transaction?.category ?? ''
  )

  const [customMode, setCustomMode] = useState(false)

  const [description, setDescription] = useState(
    transaction?.description ?? ''
  )

  const [date, setDate] = useState(
    transaction?.transactionDate ?? getTodayDate()
  )

  const [savedCategories, setSavedCategories] =
    useState<Category[]>([])

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true)

  const [isCreatingCategory, setIsCreatingCategory] =
    useState(false)

  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState('')
  const [categoryMessage, setCategoryMessage] = useState('')

  // Load categories when the form opens.
  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const data = await getCategories()

        if (!cancelled) {
          setSavedCategories(data)
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
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  // Combine predefined and saved categories.
  const categories = useMemo(() => {
    const defaults = getDefaultCategories(type)

    const custom = savedCategories
      .filter((item) => item.type === type)
      .map((item) => item.name)

    return Array.from(new Set([...defaults, ...custom]))
      .sort((a, b) => a.localeCompare(b))
  }, [type, savedCategories])

  // Existing transactions may contain legacy custom categories.
  const isCustomCategory =
    customMode ||
    (category !== '' && !categories.includes(category))

  function handleTypeChange(newType: TransactionType) {
    if (newType === type) return

    setType(newType)
    setCategory('')
    setCustomMode(false)
    setCategoryMessage('')
    setError('')
  }

  async function handleCreateCategory() {
    const name = category.trim()

    setError('')
    setCategoryMessage('')

    if (!name) {
      setError('Enter a category name.')
      return
    }

    if (name.length > 100) {
      setError('Category must be at most 100 characters.')
      return
    }

    // A default or previously saved category does not need
    // to be created again.
    const existing = categories.find(
      (item) => item.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      setCategory(existing)
      setCustomMode(false)
      setCategoryMessage('Category selected.')
      return
    }

    setIsCreatingCategory(true)

    try {
      const created = await createCategory({
        name,
        type,
      })

      setSavedCategories((previous) => [
        ...previous,
        created,
      ])

      setCategory(created.name)
      setCustomMode(false)
      setCategoryMessage('Category saved successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create category.'
      )
    } finally {
      setIsCreatingCategory(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (isLoadingCategories || isCreatingCategory) {
      return
    }

    const normalizedAmount = amount.trim()

    let amountInCents: bigint

    try {
      amountInCents = toCents(normalizedAmount)
    } catch {
      setError(
        'Enter a valid amount with up to two decimal places.'
      )
      return
    }

    if (amountInCents <= 0n) {
      setError('Amount must be greater than zero.')
      return
    }

    if (!category.trim()) {
      setError('Category is required.')
      return
    }

    if (category.trim().length > 100) {
      setError('Category must be at most 100 characters.')
      return
    }

    if (description.length > 255) {
      setError('Description must be at most 255 characters.')
      return
    }

    if (!date) {
      setError('Transaction date is required.')
      return
    }

    const data: TransactionRequest = {
      type,
      amount: normalizedAmount,
      category: category.trim(),
      description: description.trim() || null,
      transactionDate: date,
    }

    setIsSaving(true)

    try {
      await onSave(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save transaction.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isBusy = isSaving || isCreatingCategory

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 ' +
    'outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100'

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        {transaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      {/* Transaction Type */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(['INCOME', 'EXPENSE'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleTypeChange(option)}
            disabled={isBusy}
            aria-pressed={type === option}
            className={`cursor-pointer rounded-lg border px-4 py-3 font-medium transition ${
              type === option
                ? 'border-violet-700 bg-violet-50 text-violet-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {option === 'INCOME' ? 'Income' : 'Expense'}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <label
            htmlFor="transaction-amount"
            className="mb-2 block text-sm font-medium"
          >
            Amount (SGD)
          </label>

          <input
            id="transaction-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="85.50"
            required
            disabled={isBusy}
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="transaction-category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <select
            id="transaction-category"
            value={
              isCustomCategory
                ? '__custom__'
                : category
            }
            onChange={(event) => {
              const value = event.target.value

              setError('')
              setCategoryMessage('')

              if (value === '__custom__') {
                setCategory('')
                setCustomMode(true)
              } else {
                setCategory(value)
                setCustomMode(false)
              }
            }}
            required
            disabled={isBusy || isLoadingCategories}
            className={inputClass}
          >
            <option value="" disabled>
              {isLoadingCategories
                ? 'Loading categories...'
                : 'Select category'}
            </option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

            <option value="__custom__">
              + Custom Category
            </option>
          </select>

          {isCustomCategory && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                aria-label="Custom category name"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setCategoryMessage('')
                }}
                placeholder="Enter custom category"
                maxLength={100}
                required
                disabled={isBusy}
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => void handleCreateCategory()}
                disabled={isBusy || isLoadingCategories}
                className="cursor-pointer rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
              >
                {isCreatingCategory
                  ? 'Saving Category...'
                  : 'Save Category'}
              </button>

              <p className="text-xs text-slate-500">
                Save Category stores this name for future transactions.
                You can also save this transaction without adding
                the category to your saved list.
              </p>
            </div>
          )}

          {categoryMessage && (
            <p
              role="status"
              className="mt-2 text-sm text-emerald-700"
            >
              {categoryMessage}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="transaction-date"
            className="mb-2 block text-sm font-medium"
          >
            Date
          </label>

          <input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            disabled={isBusy}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="transaction-description"
            className="mb-2 block text-sm font-medium"
          >
            Description (optional)
          </label>

          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Weekly shopping"
            maxLength={255}
            disabled={isBusy}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-slate-700 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isBusy || isLoadingCategories}
          className="cursor-pointer rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  )
}

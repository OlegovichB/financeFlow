
import { useState } from 'react'
import type { FormEvent } from 'react'

import type {
  Transaction,
  TransactionRequest,
  TransactionType,
} from '../api/transactions'

interface TransactionFormProps {
  transaction?: Transaction | null
  onSave: (data: TransactionRequest) => Promise<void>
  onCancel: () => void
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
    transaction ? String(transaction.amount) : ''
  )
  const [category, setCategory] = useState(
    transaction?.category ?? ''
  )
  const [description, setDescription] = useState(
    transaction?.description ?? ''
  )
  const [date, setDate] = useState(
    transaction?.transactionDate ??
      new Date().toLocaleDateString('en-CA')
  )

  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const normalizedAmount = amount.trim()

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) {
      setError('Enter an amount with up to two decimal places.')
      return
    }

    const numericAmount = Number(normalizedAmount)

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount >= 10 ** 13
    ) {
      setError('Enter a valid positive amount.')
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
      amount: numericAmount,
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
          : 'Unable to save transaction'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-3 ' +
    'outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100'

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        {transaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {(['INCOME', 'EXPENSE'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            disabled={isSaving}
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
            disabled={isSaving}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="transaction-category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>
          <input
            id="transaction-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Groceries"
            maxLength={100}
            required
            disabled={isSaving}
            className={inputClass}
          />
        </div>

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
            disabled={isSaving}
            className={inputClass}
          />
        </div>

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
            disabled={isSaving}
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
          disabled={isSaving}
          className="cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-slate-700 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  )
}

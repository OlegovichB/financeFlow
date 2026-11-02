
import type { Transaction } from '../api/transactions'
import { toCents } from './money'

export interface MonthlyAnalytics {
  month: string
  label: string
  income: bigint
  expenses: bigint
  balance: bigint
  transactionCount: number
}

export interface AnalyticsSummary {
  income: bigint
  expenses: bigint
  balance: bigint
  transactionCount: number
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

export function calculateMonthlyAnalytics(
  transactions: Transaction[],
  monthCount = 6,
  referenceDate = new Date()
): MonthlyAnalytics[] {
  const result: MonthlyAnalytics[] = []

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1
    )

    result.push({
      month: getMonthKey(date),
      label: date.toLocaleDateString('en-SG', {
        month: 'short',
        year: 'numeric',
      }),
      income: 0n,
      expenses: 0n,
      balance: 0n,
      transactionCount: 0,
    })
  }

  const months = new Map(
    result.map((item) => [item.month, item])
  )

  for (const transaction of transactions) {
    const monthKey = transaction.transactionDate.slice(0, 7)
    const month = months.get(monthKey)

    if (!month) continue

    const amount = toCents(transaction.amount)

    if (transaction.type === 'INCOME') {
      month.income += amount
    } else {
      month.expenses += amount
    }

    month.transactionCount++
  }

  for (const month of result) {
    month.balance = month.income - month.expenses
  }

  return result
}

export function calculateAnalyticsSummary(
  months: MonthlyAnalytics[]
): AnalyticsSummary {
  return months.reduce<AnalyticsSummary>(
    (summary, month) => ({
      income: summary.income + month.income,
      expenses: summary.expenses + month.expenses,
      balance: summary.balance + month.balance,
      transactionCount:
        summary.transactionCount + month.transactionCount,
    }),
    {
      income: 0n,
      expenses: 0n,
      balance: 0n,
      transactionCount: 0,
    }
  )
}

// Convert BigInt values into percentage heights for charts.
export function calculateBarHeight(
  value: bigint,
  maximum: bigint
): number {
  if (maximum <= 0n || value <= 0n) return 0

  const percentage = (value * 100n) / maximum

  return Number(percentage > 100n ? 100n : percentage)
}


export interface CategorySpending {
  category: string
  total: bigint
  transactionCount: number
  percentage: number
}

export function calculateCategorySpending(
  transactions: Transaction[],
  months: MonthlyAnalytics[]
): CategorySpending[] {
  const selectedMonths = new Set(
    months.map((month) => month.month)
  )

  const spending = new Map<
    string,
    {
      category: string
      total: bigint
      transactionCount: number
    }
  >()

  let totalExpenses = 0n

  for (const transaction of transactions) {
    if (transaction.type !== 'EXPENSE') {
      continue
    }

    const month = transaction.transactionDate.slice(0, 7)

    if (!selectedMonths.has(month)) {
      continue
    }

    const amount = toCents(transaction.amount)
    const category = transaction.category.trim() || 'Other'
    const key = category.toLocaleLowerCase('en')

    const existing = spending.get(key)

    if (existing) {
      existing.total += amount
      existing.transactionCount++
    } else {
      spending.set(key, {
        category,
        total: amount,
        transactionCount: 1,
      })
    }

    totalExpenses += amount
  }

  return Array.from(spending.values())
    .map((item) => ({
      ...item,
      percentage:
        totalExpenses > 0n
          ? Number(
              (item.total * 10000n + totalExpenses / 2n) /
                totalExpenses
            ) / 100
          : 0,
    }))
    .sort((a, b) => {
      if (a.total === b.total) {
        return a.category.localeCompare(b.category)
      }

      return a.total > b.total ? -1 : 1
    })
}

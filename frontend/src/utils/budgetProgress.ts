
import type { Budget } from '../api/budgets'
import type { Transaction } from '../api/transactions'

import { toCents } from './money'

export interface BudgetProgress {
  budget: Budget
  limit: bigint
  spent: bigint
  remaining: bigint
  percentage: number
  transactionCount: number
  status: 'SAFE' | 'WARNING' | 'EXCEEDED'
}

export interface BudgetSummary {
  totalLimit: bigint
  totalSpent: bigint
  totalRemaining: bigint
  exceededCount: number
}

export function calculateBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  selectedMonth: string
): BudgetProgress[] {
  return budgets.map((budget) => {
    const limit = toCents(budget.amount)

    let spent = 0n
    let transactionCount = 0

    for (const transaction of transactions) {
      if (transaction.type !== 'EXPENSE') {
        continue
      }

      if (transaction.transactionDate.slice(0, 7) !== selectedMonth) {
        continue
      }

      if (
        transaction.category.trim().toLowerCase() !==
        budget.category.trim().toLowerCase()
      ) {
        continue
      }

      spent += toCents(transaction.amount)
      transactionCount++
    }

    const remaining = limit - spent

    // Calculate percentages using integer arithmetic.
    // This avoids floating-point errors with money.
    const percentage =
      limit > 0n
        ? Number((spent * 10000n) / limit) / 100
        : 0

    let status: BudgetProgress['status'] = 'SAFE'

    if (spent > limit) {
      status = 'EXCEEDED'
    } else if (spent * 100n >= limit * 80n) {
      status = 'WARNING'
    }

    return {
      budget,
      limit,
      spent,
      remaining,
      percentage,
      transactionCount,
      status,
    }
  })
}

export function calculateBudgetSummary(
  progress: BudgetProgress[]
): BudgetSummary {
  return progress.reduce<BudgetSummary>(
    (summary, item) => ({
      totalLimit: summary.totalLimit + item.limit,
      totalSpent: summary.totalSpent + item.spent,
      totalRemaining: summary.totalRemaining + item.remaining,
      exceededCount:
        summary.exceededCount +
        (item.status === 'EXCEEDED' ? 1 : 0),
    }),
    {
      totalLimit: 0n,
      totalSpent: 0n,
      totalRemaining: 0n,
      exceededCount: 0,
    }
  )
}

export function getProgressBarWidth(
  percentage: number
): number {
  return Math.min(100, Math.max(0, percentage))
}

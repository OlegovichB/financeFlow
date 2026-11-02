import type { Transaction, TransactionType } from '../api/transactions'
import { toCents } from './money'

export type TypeFilter = TransactionType | 'ALL'
export type SortOrder = 'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW'

export interface TransactionFilters {
  search: string
  type: TypeFilter
  category: string
  dateFrom: string
  dateTo: string
  sort: SortOrder
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: '',
  type: 'ALL',
  category: '',
  dateFrom: '',
  dateTo: '',
  sort: 'NEWEST',
}

export function getTransactionCategories(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((transaction) => transaction.category))]
    .sort((a, b) => a.localeCompare(b, 'en'))
}

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    return []
  }

  const query = filters.search.trim().toLocaleLowerCase()

  const filtered = transactions.filter((transaction) => {
    if (filters.type !== 'ALL' && transaction.type !== filters.type) {
      return false
    }

    if (filters.category && transaction.category !== filters.category) {
      return false
    }

    if (filters.dateFrom && transaction.transactionDate < filters.dateFrom) {
      return false
    }

    if (filters.dateTo && transaction.transactionDate > filters.dateTo) {
      return false
    }

    if (query) {
      const searchable = `${transaction.category} ${transaction.description ?? ''}`
        .toLocaleLowerCase()
      if (!searchable.includes(query)) {
        return false
      }
    }

    return true
  })

  return filtered.sort((a, b) => {
    if (filters.sort === 'AMOUNT_HIGH' || filters.sort === 'AMOUNT_LOW') {
      const left = toCents(a.amount)
      const right = toCents(b.amount)
      const difference = left === right ? 0 : left > right ? 1 : -1
      if (difference !== 0) {
        return filters.sort === 'AMOUNT_HIGH' ? -difference : difference
      }
    }

    const dateDifference = a.transactionDate.localeCompare(b.transactionDate)
    if (dateDifference !== 0) {
      return filters.sort === 'OLDEST' ? dateDifference : -dateDifference
    }

    return filters.sort === 'OLDEST' ? a.id - b.id : b.id - a.id
  })
}

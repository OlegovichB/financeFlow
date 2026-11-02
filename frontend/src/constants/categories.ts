
import type { TransactionType } from '../api/transactions'

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Rent',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Other',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Refunds',
  'Other',
] as const

export function getCategories(
  type: TransactionType
): readonly string[] {
  return type === 'INCOME'
    ? INCOME_CATEGORIES
    : EXPENSE_CATEGORIES
}

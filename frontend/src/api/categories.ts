
import type { TransactionType } from './transactions'

const API_BASE = '/api/v1/categories'

export interface Category {
  id: number
  name: string
  type: TransactionType
  createdAt: string
}

export interface CategoryRequest {
  name: string
  type: TransactionType
}

async function checkResponse(
  response: Response
): Promise<void> {
  if (response.ok) return

  if (response.status === 401) {
    throw new Error('Your session has expired. Please log in again.')
  }

  if (response.status === 403) {
    throw new Error('Access denied. Please refresh and try again.')
  }

  if (response.status === 409) {
    throw new Error('This category already exists.')
  }

  try {
    const error: {
      message?: string
      fieldErrors?: Record<string, string>
    } = await response.json()

    const fieldMessage = error.fieldErrors
      ? Object.values(error.fieldErrors).join('. ')
      : ''

    throw new Error(
      fieldMessage ||
      error.message ||
      'Category request failed.'
    )
    } catch (error) {
    if (error instanceof SyntaxError) {
        throw new Error('Category request failed.', {
        cause: error,
        })
    }

    throw error
    }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(API_BASE, {
    credentials: 'include',
  })

  await checkResponse(response)

  return response.json() as Promise<Category[]>
}

export async function createCategory(
  data: CategoryRequest
): Promise<Category> {
  const csrfResponse = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  })

  await checkResponse(csrfResponse)

  const csrfData: { token: string } =
    await csrfResponse.json()

  const response = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfData.token,
    },
    body: JSON.stringify(data),
  })

  await checkResponse(response)

  return response.json() as Promise<Category>
}

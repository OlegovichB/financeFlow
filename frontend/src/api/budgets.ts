
const API_BASE = '/api/v1/budgets'

export interface Budget {
  id: number
  category: string
  month: string
  amount: string
  createdAt: string
}

export interface BudgetRequest {
  category: string
  month: string
  amount: string
}

interface ApiError {
  message?: string
  fieldErrors?: Record<string, string>
}

async function ensureSuccess(response: Response): Promise<void> {
  if (response.ok) return

  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.')
  }

  if (response.status === 403) {
    throw new Error('Access denied. Please refresh and try again.')
  }

  if (response.status === 409) {
    throw new Error('A budget already exists for this category and month.')
  }

  let message = `Request failed (${response.status}).`

  try {
    const data = (await response.json()) as ApiError

    if (data.fieldErrors) {
      const fields = Object.values(data.fieldErrors)

      if (fields.length > 0) {
        message = fields.join('. ')
      } else if (data.message) {
        message = data.message
      }
    } else if (data.message) {
      message = data.message
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error
    }
  }

  throw new Error(message)
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  })

  await ensureSuccess(response)

  const data = (await response.json()) as { token: string }

  return data.token
}

export async function getBudgets(
  month: string
): Promise<Budget[]> {
  const response = await fetch(
    `${API_BASE}?month=${encodeURIComponent(month)}`,
    {
      credentials: 'include',
    }
  )

  await ensureSuccess(response)

  return response.json() as Promise<Budget[]>
}

export async function createBudget(
  data: BudgetRequest
): Promise<Budget> {
  const token = await getCsrfToken()

  const response = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': token,
    },
    body: JSON.stringify(data),
  })

  await ensureSuccess(response)

  return response.json() as Promise<Budget>
}

export async function updateBudget(
  id: number,
  data: BudgetRequest
): Promise<Budget> {
  const token = await getCsrfToken()

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': token,
    },
    body: JSON.stringify(data),
  })

  await ensureSuccess(response)

  return response.json() as Promise<Budget>
}

export async function deleteBudget(
  id: number
): Promise<void> {
  const token = await getCsrfToken()

  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRF-TOKEN': token,
    },
  })

  await ensureSuccess(response)
}

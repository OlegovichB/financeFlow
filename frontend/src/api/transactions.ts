
const API_BASE = '/api/v1/transactions'


export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: number
  type: TransactionType
  amount: string
  category: string
  description: string | null
  transactionDate: string
  createdAt: string
  updatedAt: string
}

export interface TransactionRequest {
  type: TransactionType
  amount: string
  category: string
  description: string | null
  transactionDate: string
}


export interface ApiError {
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Unable to obtain CSRF token')
  }

  const data: { token: string } = await response.json()
  return data.token
}

async function mutationRequest(
  method: 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: TransactionRequest
): Promise<Response> {
  const csrfToken = await getCsrfToken()

  return fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'X-CSRF-TOKEN': csrfToken,
      ...(data ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
}


async function ensureSuccess(response: Response): Promise<void> {
  if (response.ok) {
    return
  }

  let apiError: ApiError | null = null

  try {
    apiError = (await response.json()) as ApiError
  } catch {
    // Some errors, including Spring Security filter
    // responses, may not include a JSON body.
  }

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please sign in again.'
    )
  }

  if (response.status === 403) {
    throw new Error(
      'Access denied. Please refresh and try again.'
    )
  }

  if (apiError?.fieldErrors) {
    const fieldMessages = Object.values(
      apiError.fieldErrors
    ).filter((message) => typeof message === 'string')

    if (fieldMessages.length > 0) {
      throw new Error(fieldMessages.join('. '))
    }
  }

  if (
    response.status >= 400 &&
    response.status < 500 &&
    typeof apiError?.message === 'string' &&
    apiError.message.trim()
  ) {
    throw new Error(apiError.message)
  }

  if (response.status === 404) {
    throw new Error('Transaction not found')
  }

  if (response.status === 400) {
    throw new Error('Invalid transaction details')
  }

  throw new Error('Unable to complete the request')
}


export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(API_BASE, {
    credentials: 'include',
  })

  await ensureSuccess(response)

  return response.json() as Promise<Transaction[]>
}

export async function createTransaction(
  data: TransactionRequest
): Promise<Transaction> {
  const response = await mutationRequest('POST', API_BASE, data)

  await ensureSuccess(response)

  return response.json() as Promise<Transaction>
}

export async function updateTransaction(
  id: number,
  data: TransactionRequest
): Promise<Transaction> {
  const response = await mutationRequest(
    'PUT',
    `${API_BASE}/${id}`,
    data
  )

  await ensureSuccess(response)

  return response.json() as Promise<Transaction>
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await mutationRequest(
    'DELETE',
    `${API_BASE}/${id}`
  )

  await ensureSuccess(response)
}

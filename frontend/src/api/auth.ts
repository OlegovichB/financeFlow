
const API_BASE = '/api/v1/auth'

export interface AuthUser {
  id: number
  name: string
  email: string
  currency: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/csrf`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Unable to obtain CSRF token')
  }

  const data: { token: string } = await response.json()

  return data.token
}

async function authPost(
  endpoint: string,
  body?: LoginRequest | RegisterRequest
): Promise<Response> {
  const csrfToken = await getCsrfToken()

  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

export async function login(
  credentials: LoginRequest
): Promise<AuthUser> {
  const response = await authPost('/login', credentials)

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Invalid email or password'
        : 'Login failed'
    )
  }

  return response.json() as Promise<AuthUser>
}

export async function register(
  data: RegisterRequest
): Promise<AuthUser> {
  const response = await authPost('/register', data)

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? 'Email is already registered'
        : 'Registration failed'
    )
  }

  return response.json() as Promise<AuthUser>
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to check authentication')
  }

  return response.json() as Promise<AuthUser>
}

export async function logout(): Promise<void> {
  const response = await authPost('/logout')

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}

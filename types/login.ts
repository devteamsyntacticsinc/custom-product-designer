export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  error?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

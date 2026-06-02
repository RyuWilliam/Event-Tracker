export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
}

export type UserRole = "ROLE_ADMIN" | "ROLE_USER"

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  role: UserRole | null
  userEmail: string | null
}

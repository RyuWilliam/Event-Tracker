import { getApiBaseUrl } from "@/lib/apiConfig"
import type { RegisterRequest, LoginRequest, AuthResponse } from "../types/auth.types"

const BASE_URL = getApiBaseUrl()

const TOKEN_KEY = "auth_token"

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Registration failed")
  }

  return response.json()
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Invalid credentials")
  }

  return response.json()
}

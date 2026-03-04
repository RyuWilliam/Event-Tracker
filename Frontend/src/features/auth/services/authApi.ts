import { getApiBaseUrl } from "@/lib/apiConfig"
import type { RegisterRequest, AuthResponse } from "../types/auth.types"

const BASE_URL = getApiBaseUrl()

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

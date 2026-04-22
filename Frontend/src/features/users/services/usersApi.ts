import { getAuthHeaders } from "@/features/auth"
import { getApiBaseUrl } from "@/lib/apiConfig"
import type { User } from "./users.types"

const BASE_URL = getApiBaseUrl()

export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/users/all`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`)
  }

  return response.json()
}

export async function getFavoriteReport(): Promise<Record<string, number>> {
  const response = await fetch(`${BASE_URL}/users/favorites/report`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch report: ${response.status}`)
  }

  return response.json()
}

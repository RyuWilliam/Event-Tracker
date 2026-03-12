import { useState } from "react"
import type { RegisterRequest } from "../types/auth.types"
import { registerAdmin } from "../services/authApi"

interface UseRegisterAdminResult {
  isLoading: boolean
  error: string | null
  success: boolean
  registerAdminUser: (data: RegisterRequest) => Promise<void>
}

export function useRegisterAdmin(): UseRegisterAdminResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const registerAdminUser = async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await registerAdmin(data)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Admin registration failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    success,
    registerAdminUser,
  }
}

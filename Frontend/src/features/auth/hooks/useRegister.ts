import { useState } from "react"
import type { RegisterRequest } from "../types/auth.types"
import { register } from "../services/authApi"
import { useAuth } from "../store/authContext"

interface UseRegisterResult {
  isLoading: boolean
  error: string | null
  success: boolean
  registerUser: (data: RegisterRequest) => Promise<void>
}

export function useRegister(): UseRegisterResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { setToken } = useAuth()

  const registerUser = async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await register(data)
      setToken(response.accessToken)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    success,
    registerUser,
  }
}

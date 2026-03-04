import { useState } from "react"
import type { LoginRequest } from "../types/auth.types"
import { login } from "../services/authApi"
import { useAuth } from "../store/authContext"

interface UseLoginResult {
  isLoading: boolean
  error: string | null
  success: boolean
  loginUser: (data: LoginRequest) => Promise<void>
}

export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { setToken } = useAuth()

  const loginUser = async (data: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await login(data)
      setToken(response.accessToken)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    success,
    loginUser,
  }
}

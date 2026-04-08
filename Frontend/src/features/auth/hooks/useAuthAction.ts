import { useState, useCallback } from "react"
import { useAuth } from "../store/authContext"

interface UseAuthActionOptions {
  shouldSetToken?: boolean
  shouldThrowError?: boolean
  errorMessage?: string
}

interface UseAuthActionResult<TRequest> {
  isLoading: boolean
  error: string | null
  success: boolean
  execute: (data: TRequest) => Promise<void>
  reset: () => void
}

export function useAuthAction<TRequest, TResponse>(
  apiFn: (data: TRequest) => Promise<TResponse>,
  options: UseAuthActionOptions = {}
): UseAuthActionResult<TRequest> {
  const { shouldSetToken = true, shouldThrowError = false, errorMessage = "Action failed" } = options
  const { setToken } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const execute = useCallback(
    async (data: TRequest) => {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await apiFn(data)
        if (shouldSetToken && response && typeof response === "object" && "accessToken" in response) {
          setToken((response as { accessToken: string }).accessToken)
        }
        setSuccess(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage
        setError(message)
        if (shouldThrowError) {
          throw err
        }
      } finally {
        setIsLoading(false)
      }
    },
    [apiFn, shouldSetToken, shouldThrowError, errorMessage, setToken]
  )

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return { isLoading, error, success, execute, reset }
}

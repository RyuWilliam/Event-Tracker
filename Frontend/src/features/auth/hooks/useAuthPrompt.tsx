/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface OpenAuthPromptOptions {
  redirectTo?: string
}

interface AuthPromptContextType {
  isOpen: boolean
  redirectTo: string | null
  open: (options?: OpenAuthPromptOptions) => void
  close: () => void
  clearRedirect: () => void
}

const AuthPromptContext = createContext<AuthPromptContextType | null>(null)

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  const open = useCallback((options?: OpenAuthPromptOptions) => {
    if (options?.redirectTo) {
      setRedirectTo(options.redirectTo)
    }
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])
  const clearRedirect = useCallback(() => setRedirectTo(null), [])

  return (
    <AuthPromptContext.Provider value={{ isOpen, redirectTo, open, close, clearRedirect }}>
      {children}
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext)
  if (!context) {
    throw new Error("useAuthPrompt must be used within an AuthPromptProvider")
  }
  return context
}

export function useRequireAuth(isAuthenticated: boolean, callback?: () => void) {
  const { open } = useAuthPrompt()

  const requireAuth = useCallback(() => {
    if (isAuthenticated) {
      if (callback) {
        callback()
      }
      return
    }

    open()
  }, [callback, isAuthenticated, open])

  return { requireAuth }
}

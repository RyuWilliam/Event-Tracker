/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface AuthPromptContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const AuthPromptContext = createContext<AuthPromptContextType | null>(null)

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <AuthPromptContext.Provider value={{ isOpen, open, close }}>
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

export function useRequireAuth(callback?: () => void) {
  const { open } = useAuthPrompt()

  const requireAuth = useCallback(() => {
    if (callback) {
      callback()
    }
    open()
  }, [callback, open])

  return { requireAuth }
}

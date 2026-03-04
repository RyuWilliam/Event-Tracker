import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthState } from "../types/auth.types"

interface AuthContextType extends AuthState {
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "auth_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    return {
      token: storedToken,
      isAuthenticated: !!storedToken,
    }
  })

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setState({
      token,
      isAuthenticated: !!token,
    })
  }

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      setState({
        token: storedToken,
        isAuthenticated: !!storedToken,
      })
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

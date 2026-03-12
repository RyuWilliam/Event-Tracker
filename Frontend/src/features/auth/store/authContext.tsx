import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthState, UserRole } from "../types/auth.types"

interface AuthContextType extends AuthState {
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "auth_token"

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodePayload(token)
  if (!payload || typeof payload.exp !== "number") return true
  return payload.exp * 1000 < Date.now()
}

function decodeRole(token: string): UserRole | null {
  const payload = decodePayload(token)
  return (payload?.role as UserRole) ?? null
}

function buildState(token: string | null): AuthState {
  if (!token || isTokenExpired(token)) {
    if (token) localStorage.removeItem(TOKEN_KEY)
    return { token: null, isAuthenticated: false, role: null }
  }
  return {
    token,
    isAuthenticated: true,
    role: decodeRole(token),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    return buildState(storedToken)
  })

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setState(buildState(token))
  }

  const logout = () => setToken(null)

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      setState(buildState(storedToken))
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setToken, logout }}>
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

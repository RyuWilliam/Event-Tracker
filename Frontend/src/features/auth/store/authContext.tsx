import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthState, UserRole } from "../types/auth.types"

interface AuthContextType extends AuthState {
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "auth_token"

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
  return atob(padded)
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(decodeBase64Url(payload))
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
  if (!payload) return null

  const isKnownRole = (value: unknown): value is UserRole =>
    value === "ROLE_ADMIN" || value === "ROLE_USER"

  // 1. Direct role field
  if (isKnownRole(payload.role)) return payload.role

  // 2. authorities array (Spring Security standard)
  if (Array.isArray(payload.authorities)) {
    const auth = payload.authorities.find((a: any) => {
      const role = typeof a === "string" ? a : a.authority
      return role === "ROLE_ADMIN" || role === "ROLE_USER"
    })
    if (auth) return (typeof auth === "string" ? auth : auth.authority) as UserRole
  }

  // 3. scope field (sometimes roles are in scope)
  if (payload.scope) {
    const scope = String(payload.scope)
    if (scope.includes("ROLE_ADMIN")) return "ROLE_ADMIN"
    if (scope.includes("ROLE_USER")) return "ROLE_USER"
  }

  // 4. roles array (alternative format)
  if (Array.isArray(payload.roles)) {
    const role = payload.roles.find((r: any) => r === "ROLE_ADMIN" || r === "ROLE_USER")
    if (role) return role as UserRole
  }

  return null
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

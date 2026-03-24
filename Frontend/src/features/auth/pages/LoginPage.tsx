import { useEffect } from "react"
import { Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useAuthAction } from "../hooks/useAuthAction"
import { login } from "../services/authApi"
import { useAuth } from "../store/authContext"
import { LoginForm } from "../components/LoginForm"
import type { LoginRequest, AuthResponse } from "../types/auth.types"

export function LoginPage() {
  const { execute: loginUser, isLoading, error } = useAuthAction<LoginRequest, AuthResponse>(login, {
    shouldThrowError: true,
  })
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === "ROLE_ADMIN" ? "/admin" : "/events", { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleSubmit = async (data: LoginRequest) => {
    await loginUser(data)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-0 -left-4xl w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4xl w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="p-2 bg-primary rounded-lg">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Event Tracker</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to manage your events
            </p>
          </div>
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}

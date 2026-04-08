import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { useAuthAction } from "../hooks/useAuthAction"
import { login, register } from "../services/authApi"
import { useAuthPrompt } from "../hooks/useAuthPrompt"
import { useAuth } from "../store/authContext"
import { LogIn, UserPlus } from "lucide-react"
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth.types"

type AuthTab = "login" | "register"

export function AuthPopup() {
  const { isOpen, close } = useAuthPrompt()
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AuthTab>("login")
  const loginAction = useAuthAction<LoginRequest, AuthResponse>(login, { shouldThrowError: true })
  const registerAction = useAuthAction<RegisterRequest, AuthResponse>(register)

  useEffect(() => {
    if (!isAuthenticated || !role) return

    // Close the popup if it is open, then redirect by role.
    if (isOpen) {
      close()
    }
    navigate(role === "ROLE_ADMIN" ? "/admin" : "/events", { replace: true })
  }, [isOpen, isAuthenticated, role, close, navigate])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <div className="flex items-center justify-center bg-black text-white w-8 h-8 rounded-md font-bold text-xl">
              E
            </div>
            Welcome to Event Tracker
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "login" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("login")}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button
            variant={activeTab === "register" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("register")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>

        {activeTab === "login" ? (
          <LoginForm
            onSubmit={loginAction.execute}
            isLoading={loginAction.isLoading}
            error={loginAction.error}
          />
        ) : (
          <RegisterForm
            onSubmit={registerAction.execute}
            isLoading={registerAction.isLoading}
            error={registerAction.error}
            onSuccess={close}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

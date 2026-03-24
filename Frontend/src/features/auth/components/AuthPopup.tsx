import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { useAuthAction } from "../hooks/useAuthAction"
import { login, register } from "../services/authApi"
import { useAuthPrompt } from "../hooks/useAuthPrompt"
import { LogIn, UserPlus } from "lucide-react"
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth.types"

type AuthTab = "login" | "register"

export function AuthPopup() {
  const { isOpen, close } = useAuthPrompt()
  const [activeTab, setActiveTab] = useState<AuthTab>("login")
  const loginAction = useAuthAction<LoginRequest, AuthResponse>(login, { shouldThrowError: true })
  const registerAction = useAuthAction<RegisterRequest, AuthResponse>(register)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
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
            onSuccess={close}
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

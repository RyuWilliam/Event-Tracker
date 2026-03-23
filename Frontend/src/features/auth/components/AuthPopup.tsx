import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { useLogin } from "../hooks/useLogin"
import { useRegister } from "../hooks/useRegister"
import { useAuthPrompt } from "../hooks/useAuthPrompt"
import { LogIn, UserPlus } from "lucide-react"

type AuthTab = "login" | "register"

export function AuthPopup() {
  const { isOpen, close } = useAuthPrompt()
  const [activeTab, setActiveTab] = useState<AuthTab>("login")
  const login = useLogin()
  const register = useRegister()

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
            onSubmit={login.loginUser}
            isLoading={login.isLoading}
            error={login.error}
            onSuccess={close}
          />
        ) : (
          <RegisterForm
            onSubmit={register.registerUser}
            isLoading={register.isLoading}
            error={register.error}
            onSuccess={close}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

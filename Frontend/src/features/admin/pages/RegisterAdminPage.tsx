import { Calendar } from "lucide-react"
import { Link } from "react-router"
import { useRegisterAdmin } from "@/features/auth/hooks/useRegisterAdmin"
import { RegisterForm } from "@/features/auth"
import type { RegisterRequest } from "@/features/auth"

export function RegisterAdminPage() {
  const { registerAdminUser, isLoading, error, success } = useRegisterAdmin()

  const handleSubmit = async (data: RegisterRequest) => {
    await registerAdminUser(data)
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
            <h2 className="text-3xl font-bold text-primary">Admin Registration</h2>
            <p className="text-muted-foreground mt-2">
              Create a new administrator account
            </p>
          </div>
          {success && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md border border-green-200">
              Admin account created successfully!
            </div>
          )}
          <RegisterForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  )
}

import type { ReactNode } from "react"
import { useNavigate, NavLink } from "react-router"
import { LogOut, HeartIcon, CalendarDays, LogIn, Ticket } from "lucide-react"
import { APP_CONFIG } from "@/core/config"
import { useAuth, useAuthPrompt } from "@/features/auth"
import { Button } from "@/shared/ui"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, logout } = useAuth()
  const { open: openAuthPopup } = useAuthPrompt()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/events", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/events")}>
            <div className="flex items-center justify-center bg-black text-white w-8 h-8 rounded-md font-bold text-xl">
              E
            </div>
            <h1 className="text-2xl font-bold text-primary">{APP_CONFIG.name}</h1>
          </div>
          <nav className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <CalendarDays className="h-4 w-4" />
                  Events
                </NavLink>
                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <HeartIcon className="h-4 w-4" />
                  My Favorites
                </NavLink>
                <NavLink
                  to="/my-purchases"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <Ticket className="h-4 w-4" />
                  My Tickets
                </NavLink>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={openAuthPopup} className="ml-2">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/features/auth"
import type { UserRole } from "@/features/auth"

interface ProtectedRouteProps {
  requiredRole?: UserRole
}

/** Redirects unauthenticated users to /login.
 *  If requiredRole is set, also checks that the token role matches. */
export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    // Wrong role — send to their correct home
    return <Navigate to={role === "ROLE_ADMIN" ? "/admin" : "/events"} replace />
  }

  return <Outlet />
}

/** Redirects already-logged-in users away from login/register pages. */
export function GuestRoute() {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={role === "ROLE_ADMIN" ? "/admin" : "/events"} replace />
  }

  return <Outlet />
}

import { Navigate } from "react-router"
import { AdminLayout, DashboardPage, UsersPage, RegisterAdminPage, EventsPage } from "@/features/admin"
import { ExternalEventsPage, FavoritesPage } from "@/features/external"
import { RegisterPage, LoginPage } from "@/features/auth"
import { MyPurchasesPage } from "@/features/tickets"
import { CartPage } from "@/features/cart"
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute"
import { AppLayout } from "@/core/layouts/AppLayout"

export const routes = [
  {
    element: <AppLayout />,
    children: [
      // Root → public events
      {
        index: true,
        element: <Navigate to="/events" replace />,
      },

      // Public admin registration (secret route)
      {
        path: "et-admin-setup",
        Component: RegisterAdminPage,
      },

      // Public events page (no auth required)
      {
        path: "events",
        Component: ExternalEventsPage,
      },

      // Cart page (no auth required)
      {
        path: "cart",
        Component: CartPage,
      },

      // Guest-only routes (redirect away if already logged in)
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            Component: LoginPage,
          },
          {
            path: "register",
            Component: RegisterPage,
          },
        ],
      },

      // User routes (ROLE_USER)
      {
        element: <ProtectedRoute requiredRole="ROLE_USER" />,
        children: [
          {
            path: "favorites",
            Component: FavoritesPage,
          },
          {
            path: "my-purchases",
            Component: MyPurchasesPage,
          },
        ],
      },

      // Admin routes (ROLE_ADMIN)
      {
        element: <ProtectedRoute requiredRole="ROLE_ADMIN" />,
        children: [
          {
            path: "admin",
            Component: AdminLayout,
            children: [
              {
                index: true,
                Component: DashboardPage,
              },
              {
                path: "users",
                Component: UsersPage,
              },
              {
                path: "events",
                children: [
                  {
                    index: true,
                    Component: EventsPage,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

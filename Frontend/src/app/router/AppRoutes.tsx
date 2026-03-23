import { Navigate } from "react-router"
import { AdminLayout, DashboardPage, UsersPage, RegisterAdminPage } from "@/features/admin"
import { EventsListPage, CreateEventPage, EditEventPage } from "@/features/events"
import { ExternalEventsPage, FavoritesPage } from "@/features/external"
import { RegisterPage, LoginPage } from "@/features/auth"
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
                    Component: EventsListPage,
                  },
                  {
                    path: "create",
                    Component: CreateEventPage,
                  },
                  {
                    path: ":id/edit",
                    Component: EditEventPage,
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

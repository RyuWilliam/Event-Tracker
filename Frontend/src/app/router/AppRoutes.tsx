import { AdminLayout, DashboardPage } from "@/features/admin"
import { EventsListPage, CreateEventPage, EditEventPage } from "@/features/events"
import { ExternalEventsPage } from "@/features/external"
import { RegisterPage } from "@/features/auth"

export const routes = [
  {
    path: "/",
    Component: ExternalEventsPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/events",
    Component: ExternalEventsPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
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
]

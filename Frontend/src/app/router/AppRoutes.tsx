import { HomePage } from "@/features/home"
import { AdminLayout, DashboardPage } from "@/features/admin"
import { EventsListPage, CreateEventPage, EditEventPage } from "@/features/events"

export const routes = [
  {
    path: "/",
    Component: HomePage,
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

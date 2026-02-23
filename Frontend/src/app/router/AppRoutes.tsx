import { HomePage } from "@/features/home"
import { AdminLayout, DashboardPage } from "@/features/admin"

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
    ],
  },
]

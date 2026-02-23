import { HomePage } from "@/features/home"
import { DashboardPage } from "@/features/admin"

export const routes = [
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/admin/dashboard",
    Component: DashboardPage,
  },
]

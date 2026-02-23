import { Home, Calendar, Users, Settings } from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: React.ElementType
}

export const adminNavItems: NavItem[] = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

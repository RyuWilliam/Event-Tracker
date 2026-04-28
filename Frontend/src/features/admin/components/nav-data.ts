import { Home, Calendar } from "lucide-react"
import type { ElementType } from "react"

export type NavItem = {
  title: string
  url: string
  icon: ElementType
}

export const adminNavItems: NavItem[] = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Events", url: "/admin/events", icon: Calendar },
]

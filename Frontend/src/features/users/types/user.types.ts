import type { Event } from "@/features/events"

export interface User {
  id: number
  name: string
  email: string
  role: "ROLE_ADMIN" | "ROLE_USER"
  favoriteEvents: Event[]
}

import type { EventTicket } from "@/features/events"
import type { User } from "@/features/admin/services/users.types"
import type { TicketType } from "@/features/events"

export interface TicketPurchase {
  id: number
  eventTicket: EventTicket
  user: User
  quantity: number
}

export interface TicketResume {
  id?: number
  userAddress: string
  total: number
  type: TicketType
  quantity: number
  eventName: string
}

export interface PurchaseTicketPayload {
  quantity: number
  eventTicket: {
    id: number
  }
}

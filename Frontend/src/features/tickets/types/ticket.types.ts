import type { EventTicket } from "@/features/events"
import type { User } from "@/features/admin/services/users.types"
import type { TicketType } from "@/features/events"

export interface TicketPurchaseItem {
  id: number
  eventTicket: EventTicket
  quantity: number
}

export interface TicketPurchase {
  id: number
  user: User
  items: TicketPurchaseItem[]
}

export interface TicketResumeItem {
  type: TicketType
  quantity: number
  subtotal: number
}

export interface TicketResume {
  id?: number
  eventName: string
  userAddress: string
  totalQuantity: number
  total: number
  items: TicketResumeItem[]
}

export interface PurchaseTicketPayload {
  items: {
    quantity: number
    eventTicket: {
      id: number
    }
  }[]
}

export interface CartItem {
  eventTicketId: number
  eventName: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  maxAvailable: number
}

export interface CartItemPayload {
  quantity: number
  eventTicket: {
    id: number
  }
}

import type { TicketResume } from "@/features/tickets/types/ticket.types";

export interface CheckoutResult {
  success: boolean
  error?: string
  ticketResume?: TicketResume
}
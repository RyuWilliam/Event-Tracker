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

export interface CheckoutResult {
  success: boolean
  results: {
    item: CartItem
    success: boolean
    error?: string
    ticketResume?: {
      id: number
      eventName: string
      type: {
        name: string
      }
      quantity: number
      total: number
    }
  }[]
}
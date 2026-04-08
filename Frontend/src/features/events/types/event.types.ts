export type EventStatus = "ACTIVE" | "CANCELLED" | "FINISHED"

export interface EventCategory {
  id: number
  name: string
}

export interface TicketType {
  id: number
  name: string
}

export interface EventTicket {
  id?: number
  ticketType: TicketType
  totalQuantity: number
  soldQuantity: number
  price: number
  availableQuantity?: number
}

export interface Event {
  id?: number
  name: string
  description: string
  date: string
  status: EventStatus
  categories: EventCategory[]
  imageUrl?: string | null
  tickets: EventTicket[]
}

export type CreateEventPayload = Omit<Event, "id" | "tickets">

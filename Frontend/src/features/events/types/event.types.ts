export type EventStatus = "ACTIVE" | "CANCELLED" | "FINISHED"

export interface EventCategory {
  id: number
  name?: string
}

export interface Event {
  id?: number
  name: string
  description: string
  date: string
  status: EventStatus
  categories: EventCategory[]
}

export type CreateEventPayload = Omit<Event, "id">

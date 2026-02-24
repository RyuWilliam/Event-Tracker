export type EventStatus = "ACTIVE" | "CANCELLED" | "FINISHED"

export interface Event {
  id?: number
  name: string
  description: string
  date: string
  status: EventStatus
}

export type CreateEventPayload = Omit<Event, "id">

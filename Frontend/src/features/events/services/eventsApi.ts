import type { CreateEventPayload, Event } from "../types/event.types"

const BASE_URL = "http://localhost:7022/tracker/api"

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(`${BASE_URL}/events`)
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`)
  }
  return response.json()
}

export async function createEvent(data: CreateEventPayload): Promise<Event> {
  const response = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status}`)
  }

  return response.json()
}

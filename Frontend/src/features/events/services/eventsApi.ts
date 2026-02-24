import type { CreateEventPayload, Event } from "../types/event.types"

const BASE_URL = "http://localhost:7022/tracker/api"

export async function createEvent(data: CreateEventPayload): Promise<Event> {
  console.log("[eventsApi] POST request to:", `${BASE_URL}/events`)
  console.log("[eventsApi] Request body:", JSON.stringify(data, null, 2))
  
  const response = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  console.log("[eventsApi] Response status:", response.status)
  
  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status}`)
  }

  const result = await response.json()
  console.log("[eventsApi] Response body:", result)
  return result
}

import { getApiBaseUrl } from "@/lib/apiConfig"
import { getAuthHeaders } from "@/features/auth"
import type { Event } from "../types/event.types"

const BASE_URL = getApiBaseUrl()

export async function getAllEvents(): Promise<Event[]> {
  const response = await fetch(`${BASE_URL}/events`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`)
  }
  return response.json()
}

export async function updateEvent(id: number, event: Event): Promise<Event> {
  console.log("Updating event:", { id, event })
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(event),
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error("Update error response:", errorText)
    throw new Error(`Failed to update event: ${response.status} - ${errorText}`)
  }
  return response.json()
}

export async function deleteEvent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.status}`)
  }
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const response = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(event),
  })
  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status}`)
  }
  return response.json()
}

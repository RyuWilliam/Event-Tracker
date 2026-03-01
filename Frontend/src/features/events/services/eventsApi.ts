import type { CreateEventPayload, Event, EventCategory } from "../types/event.types"
import { getApiBaseUrl } from "@/lib/apiConfig"

const BASE_URL = getApiBaseUrl()

export async function getCategories(): Promise<EventCategory[]> {
  const response = await fetch(`${BASE_URL}/categories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }
  return response.json()
}

export async function createCategory(name: string): Promise<EventCategory> {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.status}`)
  }
  return response.json()
}

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

export async function getEvent(id: number): Promise<Event> {
  const response = await fetch(`${BASE_URL}/events/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.status}`)
  }
  return response.json()
}

export async function updateEvent(id: number, data: CreateEventPayload): Promise<Event> {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.status}`)
  }

  return response.json()
}

export async function likeEvent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/events/addLike/${id}`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Failed to like event: ${response.status}`)
  }
}

export async function deleteEvent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.status}`)
  }
}

export async function uploadEventImage(
  eventId: number,
  file: File
): Promise<{ imageUrl: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(
    `${BASE_URL}/images/upload?eventId=${eventId}`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || "Failed to upload image")
  }

  return response.json()
}

export async function deleteEventImage(eventId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/images/${eventId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status}`)
  }
}

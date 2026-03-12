import type { CreateEventPayload, Event, EventCategory } from "../types/event.types"
import { getApiBaseUrl } from "@/lib/apiConfig"
import { getAuthHeaders } from "@/features/auth"

const BASE_URL = getApiBaseUrl()

export async function getCategories(): Promise<EventCategory[]> {
  const response = await fetch(`${BASE_URL}/categories`, {
    headers: getAuthHeaders(),
  })
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
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.status}`)
  }
  return response.json()
}

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(`${BASE_URL}/events`, {
    headers: getAuthHeaders(),
  })
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
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.status}`)
  }

  return response.json()
}

export async function getEvent(id: number): Promise<Event> {
  const response = await fetch(`${BASE_URL}/events/${id}`, {
    headers: getAuthHeaders(),
  })
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
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.status}`)
  }

  return response.json()
}

export async function likeEvent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/users/favorites/add/${id}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to like event: ${response.status}`)
  }
}

export async function unlikeEvent(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/users/favorites/remove/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to unlike event: ${response.status}`)
  }
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
      headers: getAuthHeaders(),
    }
  )

  const responseText = await response.text()

  if (!response.ok) {
    let errorMessage = "Failed to upload image"
    try {
      const errorJson = JSON.parse(responseText)
      errorMessage = errorJson.error || errorMessage
    } catch {
      errorMessage = responseText || errorMessage
    }
    throw new Error(errorMessage)
  }

  return JSON.parse(responseText)
}

export async function deleteEventImage(eventId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/images/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status}`)
  }
}

export async function getMyFavorites(): Promise<Event[]> {
  // The backend reads the userId from the JWT token; the path variable is ignored.
  const response = await fetch(`${BASE_URL}/users/favorites/0`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch favorites: ${response.status}`)
  }

  return response.json()
}

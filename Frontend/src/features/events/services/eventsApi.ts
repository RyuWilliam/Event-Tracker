import type { CreateEventPayload, Event, EventCategory } from "../types/event.types"

const BASE_URL = "http://localhost:7022/tracker/api"

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

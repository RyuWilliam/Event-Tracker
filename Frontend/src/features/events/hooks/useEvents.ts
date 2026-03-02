import { useState, useEffect } from "react"
import type { Event } from "../types/event.types"
import { getEvents } from "../services/eventsApi"

interface UseEventsResult {
  events: Event[] | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<Event[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch events"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  }
}

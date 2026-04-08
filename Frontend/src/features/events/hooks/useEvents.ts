import { useState, useEffect, useCallback } from "react"
import type { Event } from "../types/event.types"
import { getEvents, refreshEventsStatus } from "../services/eventsApi"

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

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First trigger the refresh to keep status sync, don't block fetching the list
      refreshEventsStatus().catch(console.error)
      
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch events"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    
    // Set up an interval to refresh statuses periodically
    const intervalId = setInterval(() => {
      refreshEventsStatus().then(() => fetchEvents()).catch(console.error)
    }, 30000) // Every 30 seconds

    return () => clearInterval(intervalId)
  }, [fetchEvents])

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  }
}

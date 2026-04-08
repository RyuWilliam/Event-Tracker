import { useState, useEffect, useCallback } from "react"
import type { Event } from "../types/event.types"
import { getPopularEvents } from "../services/eventsApi"

interface UsePopularEventsResult {
  popularEvents: Event[] | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePopularEvents(): UsePopularEventsResult {
  const [popularEvents, setPopularEvents] = useState<Event[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPopularEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPopularEvents()
      setPopularEvents(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch popular events"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPopularEvents()
  }, [fetchPopularEvents])

  return { popularEvents, isLoading, error, refetch: fetchPopularEvents }
}

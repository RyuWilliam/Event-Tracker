import { useState, useEffect } from "react"
import type { Event, CreateEventPayload } from "../types/event.types"
import { getEvent, updateEvent } from "../services/eventsApi"

interface UseEventResult {
  event: Event | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEvent(id: number): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getEvent(id)
      setEvent(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch event"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [id])

  return {
    event,
    isLoading,
    error,
    refetch: fetchEvent,
  }
}

interface UseUpdateEventResult {
  updateEvent: (data: CreateEventPayload) => Promise<boolean>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
  reset: () => void
}

export function useUpdateEvent(id: number): UseUpdateEventResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = (data: CreateEventPayload): string | null => {
    if (!data.name?.trim()) {
      return "Name is required"
    }
    if (data.name.trim().length < 3) {
      return "Name must be at least 3 characters"
    }
    if (!data.date) {
      return "Date is required"
    }
    const eventDate = new Date(data.date)
    const now = new Date()
    if (eventDate <= now) {
      return "Event date cannot be in the past"
    }
    return null
  }

  const updateEventHandler = async (data: CreateEventPayload): Promise<boolean> => {
    const validationError = validate(data)
    if (validationError) {
      setError(validationError)
      return false
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await updateEvent(id, data)
      setIsSuccess(true)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update event"
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsLoading(false)
    setError(null)
    setIsSuccess(false)
  }

  return {
    updateEvent: updateEventHandler,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}

import { useState } from "react"
import type { CreateEventPayload, Event, EventStatus } from "../types/event.types"
import { createEvent } from "../services/eventsApi"

interface UseCreateEventResult {
  createEvent: (data: CreateEventPayload) => Promise<Event | null>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
  reset: () => void
}

export function useCreateEvent(): UseCreateEventResult {
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
    const now = new Date().toISOString()
    if (data.date < now) {
      return "Event date cannot be in the past"
    }
    return null
  }

  const createEventHandler = async (data: CreateEventPayload): Promise<Event | null> => {
    const payload: CreateEventPayload = {
      ...data,
      status: data.status || ("ACTIVE" as EventStatus),
    }

    const validationError = validate(payload)
    if (validationError) {
      setError(validationError)
      return null
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const createdEvent = await createEvent(payload)
      setIsSuccess(true)
      return createdEvent
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event"
      setError(message)
      return null
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
    createEvent: createEventHandler,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}

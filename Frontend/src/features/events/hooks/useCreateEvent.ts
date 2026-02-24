import { useState } from "react"
import type { CreateEventPayload, EventStatus } from "../types/event.types"
import { createEvent } from "../services/eventsApi"

interface UseCreateEventResult {
  createEvent: (data: CreateEventPayload) => Promise<boolean>
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
    const eventDate = new Date(data.date)
    const now = new Date()
    if (eventDate <= now) {
      return "Event date cannot be in the past"
    }
    return null
  }

  const createEventHandler = async (data: CreateEventPayload): Promise<boolean> => {
    console.log("[useCreateEvent] Received data:", data)
    
    const payload: CreateEventPayload = {
      ...data,
      status: data.status || ("ACTIVE" as EventStatus),
    }
    console.log("[useCreateEvent] Payload with default status:", payload)

    const validationError = validate(payload)
    if (validationError) {
      console.log("[useCreateEvent] Validation failed:", validationError)
      setError(validationError)
      return false
    }

    console.log("[useCreateEvent] Validation passed, calling API...")
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const result = await createEvent(payload)
      console.log("[useCreateEvent] API response:", result)
      setIsSuccess(true)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event"
      console.log("[useCreateEvent] API error:", message)
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
    createEvent: createEventHandler,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}

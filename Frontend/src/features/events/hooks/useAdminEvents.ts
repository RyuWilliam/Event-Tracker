import { useState, useCallback } from "react"
import type { Event } from "../types/event.types"
import * as eventsAdminApi from "../services/eventsAdminApi"
import { refreshEventsStatus } from "../services/eventsApi"

export function useAdminEvents() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAllEvents = useCallback(async (): Promise<Event[]> => {
    setLoading(true)
    setError(null)
    try {
      await refreshEventsStatus().catch(console.error)
      return await eventsAdminApi.getAllEvents()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load events"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEvent = async (id: number, event: Event): Promise<Event> => {
    setLoading(true)
    setError(null)
    try {
      return await eventsAdminApi.updateEvent(id, event)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update event"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      return await eventsAdminApi.deleteEvent(id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete event"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (event: Omit<Event, "id">): Promise<Event> => {
    setLoading(true)
    setError(null)
    try {
      return await eventsAdminApi.createEvent(event)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create event"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    loadAllEvents,
    updateEvent,
    deleteEvent,
    createEvent,
  }
}

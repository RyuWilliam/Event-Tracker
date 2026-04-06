import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle, Button, H1 } from "@/shared/ui"
import { Edit2, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAdminEvents } from "@/features/events/hooks/useAdminEvents"
import { EventEditForm } from "@/features/admin/components/EventEditForm"
import type { Event, EventCategory, TicketType } from "@/features/events/types/event.types"
import { getAllCategories } from "@/features/events/services/eventsApi"
import { getTicketTypes } from "@/features/tickets/services/ticketsApi"

interface EditingEventState {
  id: number | null
  data: Event
}

export function EventsPage() {
  const { loadAllEvents, updateEvent, deleteEvent, loading } = useAdminEvents()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [editingEvent, setEditingEvent] = useState<EditingEventState | null>(null)

  const loadEvents = async () => {
    try {
      const data = await loadAllEvents()
      setEvents(data)
    } catch (err) {
      toast.error("Failed to load events")
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch {
      // Silently fail
    }
  }

  const loadTicketTypes = async () => {
    try {
      const data = await getTicketTypes()
      setTicketTypes(data)
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    loadEvents()
    loadCategories()
    loadTicketTypes()
  }, [])

  const handleEditClick = (event: Event) => {
    setEditingEvent({
      id: event.id || 0,
      data: { ...event },
    })
  }

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      if (editingEvent?.id === null) {
        // Creating new event
        await loadAllEvents()
      } else if (editingEvent?.id) {
        // Updating existing event
        // Filter out tickets with sales - backend doesn't allow modifying them
        const eventToSend = {
          ...updatedEvent,
          tickets: updatedEvent.tickets?.filter(
            (ticket) => !ticket.id || ticket.soldQuantity === 0
          ) || [],
        }
        await updateEvent(editingEvent.id, eventToSend)
        const updated = await loadAllEvents()
        setEvents(updated)
      } else {
        throw new Error("Invalid event state")
      }
      setEditingEvent(null)
      toast.success("Event saved successfully!")
    } catch (err) {
      toast.error("Failed to save event")
      throw err
    }
  }

  const handleDeleteClick = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await deleteEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
      toast.success("Event deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete event")
    }
  }

  if (editingEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setEditingEvent(null)}
            variant="outline"
            size="sm"
          >
            ← Back
          </Button>
          <H1>Edit Event</H1>
        </div>

        <EventEditForm
          event={editingEvent.data}
          categories={categories}
          ticketTypes={ticketTypes}
          onSave={handleSaveEvent}
          onCancel={() => setEditingEvent(null)}
          isLoading={loading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <H1>Events Management</H1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              const newEvent: Event = {
                id: undefined,
                name: "",
                description: "",
                date: new Date().toISOString().split('T')[0],
                status: "ACTIVE",
                imageUrl: "",
                categories: [],
                tickets: [],
              }
              setEditingEvent({ id: null, data: newEvent })
            }}
            size="sm" 
            className="gap-2"
          >
            + New Event
          </Button>
          <Button onClick={loadEvents} disabled={loading} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          Loading events...
        </div>
      )}

      {!loading && events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No events found</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.categories?.map(cat => (
                      <span key={cat.id} className="inline-block px-2 py-1 bg-muted text-xs rounded">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                    <span>📅 {event.date}</span>
                    <span>🎫 {event.tickets?.length || 0} ticket types</span>
                    <span>💰 {event.tickets?.reduce((sum, t) => sum + (t.totalQuantity - t.soldQuantity), 0) || 0} available</span>
                  </div>
                  {event.tickets && event.tickets.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {event.tickets.map(t => (
                        <div key={t.id}>
                          • {t.ticketType?.name}: ${t.price} ({t.totalQuantity - t.soldQuantity}/{t.totalQuantity})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => handleEditClick(event)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(event.id!)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle, Button, H1, Input } from "@/shared/ui"
import { Edit2, Search, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { useAdminEvents } from "@/features/events/hooks/useAdminEvents"
import { EventEditForm } from "@/features/admin/components/EventEditForm"
import { EventSalesReport } from "@/features/admin/components/EventSalesReport"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [reportEvent, setReportEvent] = useState<Event | null>(null)
  const [showReport, setShowReport] = useState(false)

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || 
      event.categories?.some(cat => cat.id === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const handleDeleteEvent = async () => {
    if (!editingEvent?.id) return
    try {
      await deleteEvent(editingEvent.id)
      setEvents(events.filter(e => e.id !== editingEvent.id))
      setEditingEvent(null)
      toast.success("Event deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete event")
      throw err
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
          onDelete={editingEvent.id ? handleDeleteEvent : undefined}
          isLoading={loading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H1>Events Management</H1>
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
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2">Search by Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2">Filter by Category</label>
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          Loading events...
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{searchQuery || selectedCategory ? "No events match your filters" : "No events found"}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {event.imageUrl && (
                  <div className="shrink-0">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.categories?.map(cat => (
                          <span key={cat.id} className="inline-block px-2 py-1 bg-muted text-xs rounded">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => {
                          setReportEvent(event)
                          setShowReport(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Sales
                      </Button>
                      <Button
                        onClick={() => handleEditClick(event)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground mt-3">
                    <span>📅 {event.date}</span>
                    <span>🎫 {event.tickets?.length || 0} type(s)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EventSalesReport 
        event={reportEvent} 
        open={showReport} 
        onOpenChange={setShowReport} 
      />
    </div>
  )
}

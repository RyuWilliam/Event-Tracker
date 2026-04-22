import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle, Button, H1 } from "@/shared/ui"
import { Edit2, BarChart3, Settings } from "lucide-react"
import { toast } from "sonner"
import { useAdminEvents } from "@/features/events/hooks/useAdminEvents"
import { EventEditForm } from "@/features/events/components/EventEditForm"
import { EventFilters } from "@/features/events/components/EventFilters"
import { EventSalesReport } from "@/features/events/components/EventSalesReport"
import { CategoriesManagement } from "@/features/events/components/CategoriesManagement"
import type { Event, EventCategory, TicketType, EventStatus } from "@/features/events/types/event.types"
import { getAllCategories } from "@/features/events/services/eventsApi"
import { getTicketTypes } from "@/features/tickets/services/ticketsApi"
import { resolveImageUrl } from "@/lib/image"

interface EditingEventState {
  id: number | null
  data: Event
}

export function EventsPage() {
  const { loadAllEvents, updateEvent, deleteEvent, createEvent, loading } = useAdminEvents()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [editingEvent, setEditingEvent] = useState<EditingEventState | null>(null)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
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
    if (event.status === "FINISHED") {
      toast.error("Finished events cannot be edited")
      return
    }
    setEditingEvent({
      id: event.id || 0,
      data: { ...event },
    })
  }

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      if (editingEvent?.id === null) {
        // Creating new event
        await createEvent(updatedEvent)
        const updated = await loadAllEvents()
        setEvents(updated)
      } else if (editingEvent?.id) {
        // Updating existing event
        await updateEvent(editingEvent.id, updatedEvent)
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
    // Modificado para que por defecto muestre solo ACTIVE, excepto si selecciona TODOS
    const matchesStatus = (selectedStatus === null) ? event.status === "ACTIVE" : event.status === selectedStatus

    const eventDate = new Date(event.date)
    const hasValidDate = !Number.isNaN(eventDate.getTime())
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    const matchesFrom = !fromDate || (hasValidDate && eventDate >= fromDate)
    const matchesTo = !toDate || (hasValidDate && eventDate <= toDate)

    return matchesSearch && matchesCategory && matchesStatus && matchesFrom && matchesTo
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
          <H1>{editingEvent.id === null ? "Create Event" : "Edit Event"}</H1>
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
    <div className="relative pb-10">
      {/* Sticky Header with Title and Action Buttons */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background/95 backdrop-blur py-4 border-b -mt-4 -mx-4 px-4 shadow-sm mb-6">
        <H1 className="text-2xl font-bold m-0">Events Management</H1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCategoriesDialog(true)}
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Categories
          </Button>
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
      </div>

      <div className="space-y-6 px-1">
        {/* Search & Filters */}
        <EventFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          categories={categories}
        />

      {loading && events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          Loading events...
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{searchQuery || selectedCategory || selectedStatus || dateFrom || dateTo ? "No events match your filters" : "No events found"}</p>
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
                      src={resolveImageUrl(event.imageUrl) || ""}
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
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-3 items-center">
                    <span>📅 {event.date}</span>
                    <span>🎫 {event.tickets?.length || 0} type(s)</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      event.status === 'FINISHED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
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

      <CategoriesManagement
        categories={categories}
        open={showCategoriesDialog}
        onOpenChange={setShowCategoriesDialog}
        onCategoriesChange={setCategories}
      />
      </div>
    </div>
  )
}

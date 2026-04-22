import { useState, useMemo, useEffect } from "react"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Input, Button, Card } from "@/shared/ui"
import { MainLayout } from "@/core/layouts/MainLayout"
import { useEvents, usePopularEvents, likeEvent, unlikeEvent, getMyFavorites, getAllCategories, ExternalEventCard, EventDetailsDialog } from "@/features/events"
import { EventFilters } from "@/features/admin/components/EventFilters"
import { useAuth, useAuthPrompt } from "@/features/auth"
import type { Event, EventCategory, EventStatus } from "@/features/events"
import { resolveImageUrl } from "@/lib/image"

function getImageUrl(imageUrl: string | null | undefined): string | null {
  return resolveImageUrl(imageUrl)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function ExternalEventsPage() {
  const { events, isLoading, error, refetch: refetchEvents } = useEvents()
  const { popularEvents, isLoading: isPopularLoading, refetch: refetchPopular } = usePopularEvents()
  const { isAuthenticated } = useAuth()
  const { open: openAuthPopup } = useAuthPrompt()
  const [activeTab, setActiveTab] = useState<"top" | "all">("top")
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [categories, setCategories] = useState<EventCategory[]>([])

  // Selection
  const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Load categories for filter
  useEffect(() => {
    let cancelled = false
    getAllCategories().then(data => {
      if (!cancelled) setCategories(data)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    refetchEvents()
    refetchPopular()
    if (!isAuthenticated) {
      setActiveTab("top")
    }
  }, [isAuthenticated, refetchEvents, refetchPopular])

  useEffect(() => {
    if (!isAuthenticated) {
      setLikedEvents(new Set())
      return
    }
    let cancelled = false
    getMyFavorites()
      .then((favorites) => {
        if (!cancelled) {
          setLikedEvents(new Set(favorites.map((e) => e.id!)))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLikedEvents(new Set())
        }
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const filteredEvents = useMemo(() => {
    if (!events) return []

    return events.filter((event) => {
      // Name Search
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category Match
      const matchesCategory = selectedCategory === null || 
        event.categories?.some(cat => cat.id === selectedCategory)
      
      // Default to "ACTIVE" for users, unless they select "ALL" or something else explicitly
      const matchesStatus = (selectedStatus === null) ? event.status === "ACTIVE" : event.status === selectedStatus

      // Date Range Match
      const eventDate = new Date(event.date)
      const hasValidDate = !Number.isNaN(eventDate.getTime())
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null

      const matchesFrom = !fromDate || (hasValidDate && eventDate >= fromDate)
      const matchesTo = !toDate || (hasValidDate && eventDate <= toDate)

      return matchesSearch && matchesCategory && matchesStatus && matchesFrom && matchesTo
    })
  }, [events, searchQuery, selectedCategory, selectedStatus, dateFrom, dateTo])

  const handleLike = async (eventId: number) => {
    const alreadyLiked = likedEvents.has(eventId)

    try {
      if (alreadyLiked) {
        await unlikeEvent(eventId)
        setLikedEvents((prev) => {
          const next = new Set(prev)
          next.delete(eventId)
          return next
        })
        toast.success("Removed from favorites")
      } else {
        await likeEvent(eventId)
        setLikedEvents((prev) => new Set(prev).add(eventId))
        toast.success("Added to favorites!")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update favorite"
      toast.error(message)
    }
  }

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event)
    setDetailsDialogOpen(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {!isAuthenticated && (
          <div className="flex bg-muted/30 p-1 border border-border rounded-lg inline-flex max-w-fit">
            <Button
              variant={activeTab === "top" ? "default" : "ghost"}
              onClick={() => setActiveTab("top")}
              className="w-32"
              size="sm"
            >
              Top Events
            </Button>
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="w-32"
              size="sm"
            >
              All Events
            </Button>
          </div>
        )}

        {(!isAuthenticated && activeTab === "top") ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Top 5 Most Popular Events</h2>
            {isPopularLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading top events...</p>
              </div>
            ) : popularEvents && popularEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {popularEvents.slice(0, 5).map((ev) => (
                  <Card key={ev.id} className="flex flex-col md:flex-row overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
                    <div className="md:w-2/5 h-56 md:h-auto relative shrink-0 overflow-hidden">
                      {ev.imageUrl ? (
                        <img 
                          src={getImageUrl(ev.imageUrl) || ''} 
                          alt={ev.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{ev.name}</h3>
                      <div className="flex items-center text-sm text-primary mb-4 font-semibold">
                        {formatDate(ev.date)}
                      </div>
                      <div className="text-muted-foreground text-sm mb-6 line-clamp-3">
                        {ev.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-auto pb-4 md:pb-0">
                        {ev.categories?.map(c => (
                          <span key={c.id} className="px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full text-[11px] uppercase tracking-wider font-semibold">
                            {c.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 md:mt-6">
                        <Button 
                          onClick={() => openAuthPopup()} 
                          variant="default"
                          className="w-full md:w-auto"
                        >
                          Buy Tickets
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No popular events available.</p>
            )}
          </div>
        ) : (
          <>
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
              hideStatusFilter={true}
            />

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-destructive">Error: {error}</p>
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}

            {!isLoading && !error && filteredEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No events found" : "No events available"}
                </p>
              </div>
            )}

            {!isLoading && !error && filteredEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <ExternalEventCard
                    key={event.id}
                    event={event}
                    isLiked={likedEvents.has(event.id!)}
                    onLike={handleLike}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <EventDetailsDialog
        open={detailsDialogOpen}
        event={selectedEvent}
        onOpenChange={setDetailsDialogOpen}
      />
    </MainLayout>
  )
}

import { useState, useMemo } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/shared/ui"
import { MainLayout } from "@/core/layouts/MainLayout"
import { useEvents } from "@/features/events"
import { ExternalEventCard } from "../components/ExternalEventCard"

export function ExternalEventsPage() {
  const { events, isLoading, error } = useEvents()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = useMemo(() => {
    if (!events) return []
    if (!searchQuery.trim()) return events
    
    const query = searchQuery.toLowerCase()
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.categories?.some((cat) => cat.name.toLowerCase().includes(query))
    )
  }, [events, searchQuery])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

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
              <ExternalEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

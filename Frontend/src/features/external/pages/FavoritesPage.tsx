import { useState, useEffect } from "react"
import { HeartIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { MainLayout } from "@/core/layouts/MainLayout"
import { Badge, Button } from "@/shared/ui"
import { getMyFavorites, unlikeEvent } from "@/features/events"
import type { Event } from "@/features/events"
import { resolveImageUrl } from "@/lib/image"

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const year = date.getFullYear()
  const time = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" })
  return { day, month, year, time }
}

function getImageUrl(imageUrl: string | null | undefined): string | null {
  return resolveImageUrl(imageUrl)
}

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"ACTIVE" | "HISTORICAL">("ACTIVE")

  useEffect(() => {
    getMyFavorites()
      .then(setFavorites)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load favorites"))
      .finally(() => setIsLoading(false))
  }, [])

  const handleUnlike = async (eventId: number) => {
    try {
      await unlikeEvent(eventId)
      setFavorites((prev) => prev.filter((e) => e.id !== eventId))
      toast.success("Removed from favorites")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove favorite")
    }
  }

  const activeFavorites = favorites.filter(e => e.status === "ACTIVE" || !e.status || e.status === "CANCELLED");
  const historicalFavorites = favorites.filter(e => e.status === "FINISHED");

  const displayedFavorites = viewMode === "ACTIVE" ? activeFavorites : historicalFavorites;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6 fill-accent text-accent" />
            <h2 className="text-2xl font-bold">My Favorites</h2>
          </div>
          
          <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setViewMode("ACTIVE")}
              className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "ACTIVE" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setViewMode("HISTORICAL")}
              className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "HISTORICAL" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Historical
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-muted-foreground">Loading your favorites...</p>
        )}

        {error && (
          <p className="text-destructive">Error: {error}</p>
        )}

        {!isLoading && !error && displayedFavorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <HeartIcon className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {viewMode === "ACTIVE" 
                ? "You haven't liked any current events yet." 
                : "No historical favorites found."}
            </p>
          </div>
        )}

        {!isLoading && !error && displayedFavorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedFavorites.map((event) => {
              const { day, month, year, time } = formatEventDate(event.date)
              const imageUrl = getImageUrl(event.imageUrl)

              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-md"
                >
                  {event.status === "CANCELLED" && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                        Cancelled
                      </Badge>
                    </div>
                  )}
                  {imageUrl ? (
                    <div className="w-full h-40 shrink-0">
                      <img
                        src={imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 shrink-0 flex items-center justify-center bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 px-2 py-1 text-center min-w-[40px]">
                        <span className="text-lg font-bold text-primary">{day}</span>
                        <span className="text-[10px] font-medium text-secondary">{month}</span>
                        <span className="text-[10px] text-muted-foreground">{year}</span>
                        <span className="text-[10px] font-medium text-secondary mt-1">{time}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">{event.name}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                        {event.categories && event.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.categories.map((cat) => (
                              <Badge key={cat.id} variant="secondary" className="text-xs">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 shrink-0"
                          title="Remove from favorites"
                          onClick={() => handleUnlike(event.id!)}
                        >
                          <HeartIcon className="h-5 w-5 fill-accent text-accent" />
                        </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

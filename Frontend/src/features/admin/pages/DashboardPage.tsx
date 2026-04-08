import { useState, useEffect } from "react"
import { TrophyIcon, RefreshCw, Ticket, DollarSign, Calendar } from "lucide-react"
import { H1, Card, CardContent, Button, Badge } from "@/shared/ui"
import { getPopularEvents } from "@/features/events/services/eventsApi"
import type { Event, EventTicket } from "@/features/events/types/event.types"
import { resolveImageUrl } from "@/lib/image"

function getImageUrl(imageUrl: string | null | undefined): string | null {
  return resolveImageUrl(imageUrl)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function calculateTotalRevenue(tickets: EventTicket[] | undefined): number {
  if (!tickets) return 0;
  return tickets.reduce((acc, ticket) => acc + (ticket.soldQuantity * (ticket.price || 0)), 0);
}

function calculateTotalTicketsSold(tickets: EventTicket[] | undefined): number {
  if (!tickets) return 0;
  return tickets.reduce((acc, ticket) => acc + ticket.soldQuantity, 0);
}

export function DashboardPage() {
  const [popularEvents, setPopularEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = () => {
    setIsLoading(true)
    setError(null)
    getPopularEvents()
      .then(setPopularEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load popular events"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadReport()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <H1>Dashboard</H1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold tracking-tight">Top Selling Events Overview</h2>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading top events data...</p>
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm py-4 text-center">Error: {error}</p>
          )}

          {!isLoading && !error && popularEvents.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">No popular events recorded yet.</p>
          )}

          {!isLoading && !error && popularEvents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Rank</th>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold">Date & Status</th>
                    <th className="px-4 py-3 font-semibold">Tickets Sold</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {popularEvents.map((event, index) => {
                    const revenue = calculateTotalRevenue(event.tickets);
                    const sold = calculateTotalTicketsSold(event.tickets);
                    
                    return (
                      <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4 w-[250px]">
                          <div className="flex items-center gap-3">
                            {event.imageUrl ? (
                              <img src={getImageUrl(event.imageUrl) || ''} alt={event.name} className="w-10 h-10 rounded-md shrink-0 object-cover border border-border" />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate max-w-[150px]" title={event.name}>{event.name}</div>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {event.categories?.slice(0, 2).map(c => (
                                  <span key={c.id} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded truncate max-w-[70px]">
                                    {c.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <span className="text-muted-foreground">{formatDate(event.date)}</span>
                            <Badge variant={event.status === "ACTIVE" ? "default" : event.status === "CANCELLED" ? "destructive" : "secondary"} className="w-fit text-[10px] h-4 px-1.5 flex items-center justify-center">
                              {event.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{sold}</span>
                            <span className="text-xs text-muted-foreground">sold</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 font-bold text-base text-green-600 dark:text-green-500">
                            <DollarSign className="h-4 w-4" />
                            {revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

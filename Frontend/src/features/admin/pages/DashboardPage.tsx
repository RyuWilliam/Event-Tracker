import { useState, useEffect } from "react"
import { DollarSign, Calendar, Users, Activity, TrophyIcon, Ticket } from "lucide-react"
import { H1, Card, CardContent } from "@/shared/ui"
import { getAllEvents, getTotalSales } from "@/features/events/services/eventsAdminApi"
import { getAllUsers } from "@/features/admin/services/usersApi"
import { getPopularEvents } from "@/features/events/services/eventsApi"
import type { Event, EventTicket } from "@/features/events/types/event.types"
import type { User } from "@/features/admin/services/users.types"
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
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [popularEvents, setPopularEvents] = useState<Event[]>([])
  const [totalSales, setTotalSales] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [eventsData, usersData, salesData, popularEventsData] = await Promise.all([
        getAllEvents(),
        getAllUsers(),
        getTotalSales().catch(() => 0), // Fallback if endpoint unsupported
        getPopularEvents().catch(() => []), // Safe fallback for popular events
      ])
      
      setEvents(eventsData)
      setUsers(usersData)
      setTotalSales(salesData)
      setPopularEvents(popularEventsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const activeEventsCount = events.filter(e => e.status === "ACTIVE").length
  const pastEventsCount = events.filter(e => e.status === "FINISHED").length
  const cancelledEventsCount = events.filter(e => e.status === "CANCELLED").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <H1>Dashboard</H1>
      </div>

      {error ? (
        <p className="text-destructive text-sm py-4">Error: {error}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <h3 className="text-2xl font-bold">
                      {isLoading ? "-" : `$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "-" : activeEventsCount}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted text-muted-foreground rounded-full">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Past Events</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "-" : pastEventsCount}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cancelled Events</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "-" : cancelledEventsCount}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registered Users</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "-" : users.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold tracking-tight">Top Selling Events Overview</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading top events data...</p>
                </div>
              ) : popularEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No popular events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Rank</th>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
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
                              <span className="text-muted-foreground">{formatDate(event.date)}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Ticket className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{sold}</span>
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Registered Users</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading users data...</p>
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No registered users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold rounded-tr-lg">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-foreground">
                            {user.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase border ${
                                user.role === "ROLE_ADMIN" 
                                  ? "border-blue-500 text-blue-600 bg-transparent" 
                                  : "border-emerald-500 text-emerald-600 bg-transparent"
                              }`}
                            >
                              {user.role.replace("ROLE_", "")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

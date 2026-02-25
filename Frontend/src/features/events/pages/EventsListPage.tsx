import { Link } from "react-router"
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, H1 } from "@/shared/ui"
import type { Event } from "../types/event.types"

const mockEvents: Event[] = [
  {
    id: 1,
    name: "Tech Conference 2026",
    description: "Annual technology conference featuring the latest innovations",
    date: "2026-06-15T09:00:00",
    status: "ACTIVE",
    categories: [],
  },
  {
    id: 2,
    name: "Team Workshop",
    description: "Internal team building and skills workshop",
    date: "2026-04-20T14:00:00",
    status: "ACTIVE",
    categories: [],
  },
  {
    id: 3,
    name: "Product Launch",
    description: "Launch event for our new product line",
    date: "2026-05-10T10:00:00",
    status: "FINISHED",
    categories: [],
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "CANCELLED":
      return "destructive"
    case "FINISHED":
      return "secondary"
    default:
      return "default"
  }
}

export function EventsListPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <H1>Events</H1>
        <Button asChild>
          <Link to="/admin/events/create">Create Event</Link>
        </Button>
      </div>

      {mockEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events yet. Create your first event.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{event.name}</span>
                  <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {event.description || "No description"}
                </p>
                <p className="text-sm">{formatDate(event.date)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

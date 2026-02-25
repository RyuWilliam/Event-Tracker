import { Link } from "react-router"
import { PencilIcon, HeartIcon } from "lucide-react"
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, H1 } from "@/shared/ui"
import { useEvents } from "../hooks/useEvents"

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
  const { events, isLoading, error, refetch } = useEvents()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <H1>Events</H1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/events/create">Create Event</Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading events...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error: {error}</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events && events.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events yet. Create your first event.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events && events.length > 0 && (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{event.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <HeartIcon className="h-4 w-4" />
                      <span className="text-sm">{event.likes || 0}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/events/${event.id}/edit`}>
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {event.description || "No description"}
                </p>
                <p className="text-sm">{formatDate(event.date)}</p>
                {event.categories && event.categories.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {event.categories.map((category) => (
                      <Badge key={category.id} variant="accent">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

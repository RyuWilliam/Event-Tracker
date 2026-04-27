import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui"
import { Badge } from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import { EventTicketsView } from "@/features/events"
import type { Event } from "@/features/events"
import { resolveImageUrl } from "@/lib/image"

interface EventDetailsDialogProps {
  open: boolean
  event: Event | null
  onOpenChange: (open: boolean) => void
}

function getImageUrl(imageUrl: string | null | undefined): string | null {
  return resolveImageUrl(imageUrl)
}

function formatEventDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EventDetailsDialog({
  open,
  event,
  onOpenChange,
}: EventDetailsDialogProps) {
  const imageUrl = event ? getImageUrl(event.imageUrl) : null
  const eventId = event?.id
  const hasTickets = Boolean(eventId) && Boolean(event?.tickets && event.tickets.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {imageUrl && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{formatEventDate(event.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={event.status === "ACTIVE" ? "default" : "secondary"}>
                      {event.status}
                    </Badge>
                  </div>
                </div>

                {event.categories && event.categories.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {event.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hasTickets ? (
                <div className="space-y-4 border-t pt-4">
                  {eventId ? (
                    <EventTicketsView
                      eventId={eventId}
                      eventName={event.name}
                      tickets={event.tickets}
                    />
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm">This event is not available for purchase yet</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">No tickets available for this event</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

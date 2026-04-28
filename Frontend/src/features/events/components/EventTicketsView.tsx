import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Badge,
} from "@/shared/ui"
import { ShoppingBag, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router"
import { useAuth, useAuthPrompt } from "@/features/auth"
import type { EventTicket } from "../types/event.types"

export interface EventTicketsViewProps {
  eventId: number
  eventName?: string
  tickets: EventTicket[]
}

export function EventTicketsView({
  eventId,
  eventName = "Event",
  tickets,
}: EventTicketsViewProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { open: openAuthPopup } = useAuthPrompt()

  const handleGoToPurchase = () => {
    if (!isAuthenticated) {
      openAuthPopup({ redirectTo: `/events/${eventId}/purchase` })
      return
    }

    navigate(`/events/${eventId}/purchase`)
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        <AlertCircle className="mr-2 h-4 w-4" />
        No tickets available for this event
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Tickets</h3>
      <p className="text-sm text-muted-foreground">
        Continue to checkout to choose quantities across ticket types for {eventName}.
      </p>

      <div className="grid gap-3">
        {tickets.map((ticket) => {
          const available = (ticket.totalQuantity ?? 0) - (ticket.soldQuantity ?? 0)
          const isAvailable = available > 0

          return (
            <Card key={ticket.id ?? ticket.ticketType.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <CardTitle className="text-base">{ticket.ticketType.name}</CardTitle>
                      <Badge className={isAvailable ? "bg-green-600 text-white hover:bg-green-700" : "bg-black text-white hover:bg-black/90"}>
                        {isAvailable ? "Available" : "Sold out"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm font-medium text-foreground">
                      <p>Price: ${ticket.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button
        onClick={handleGoToPurchase}
        size="lg"
        className="w-full gap-2 mt-4"
        disabled={tickets.every((t) => ((t.totalQuantity ?? 0) - (t.soldQuantity ?? 0)) <= 0)}
      >
        <ShoppingBag className="h-4 w-4" />
        Buy Tickets
      </Button>
    </div>
  )
}

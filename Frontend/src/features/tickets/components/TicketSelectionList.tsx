import { Minus, Plus } from "lucide-react"
import { Button, Card, CardContent, CardTitle, Badge } from "@/shared/ui"
import type { EventTicket } from "@/features/events"
import { getAvailableQuantity } from "../utils/directPurchase"

interface TicketSelectionListProps {
  tickets: EventTicket[]
  quantities: Record<number, number>
  isEventPurchasable: boolean
  onQuantityChange: (ticket: EventTicket, delta: number) => void
}

export function TicketSelectionList({
  tickets,
  quantities,
  isEventPurchasable,
  onQuantityChange,
}: TicketSelectionListProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          No tickets are available for this event.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const available = getAvailableQuantity(ticket)
        const selected = ticket.id ? quantities[ticket.id] ?? 0 : 0
        const soldOut = available <= 0

        return (
          <Card key={ticket.id ?? ticket.ticketType.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{ticket.ticketType.name}</CardTitle>
                    <Badge variant={soldOut ? "destructive" : "secondary"}>
                      {soldOut ? "Sold out" : `${available} available`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">${ticket.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={soldOut || selected <= 0 || !isEventPurchasable}
                    onClick={() => onQuantityChange(ticket, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{selected}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={soldOut || selected >= available || !isEventPurchasable}
                    onClick={() => onQuantityChange(ticket, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
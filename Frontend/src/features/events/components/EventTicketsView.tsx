import { useState } from "react"
import { Card, CardContent, CardTitle, Button, Badge, Input } from "@/shared/ui"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { EventTicket } from "../types/event.types"
import { useTicketPurchase } from "@/features/tickets"
import type { TicketResume } from "@/features/tickets"

interface EventTicketsViewProps {
  tickets: EventTicket[]
  eventId: number
  onPurchaseSuccess?: (ticketResume: TicketResume) => void
}

interface TicketQuantityMap {
  [ticketId: number]: number
}

export function EventTicketsView({
  tickets,
  onPurchaseSuccess,
}: EventTicketsViewProps) {
  const { purchase, loading, error } = useTicketPurchase()
  const [purchasingTicketId, setPurchasingTicketId] = useState<number | null>(null)
  const [quantities, setQuantities] = useState<TicketQuantityMap>(
    tickets.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 1 }), {})
  )

  const handleQuantityChange = (ticketId: number, value: string) => {
    const num = parseInt(value) || 1
    const ticket = tickets.find(t => t.id === ticketId)
    const maxAvailable = ticket ? ticket.totalQuantity - ticket.soldQuantity : 0
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(1, Math.min(num, maxAvailable))
    }))
  }

  const handlePurchase = async (ticket: EventTicket) => {
    const available = ticket.totalQuantity - ticket.soldQuantity
    const quantity = quantities[ticket.id] || 1

    if (available <= 0) {
      toast.error("No tickets available for this type")
      return
    }

    if (quantity > available) {
      toast.error(`Only ${available} tickets available`)
      return
    }

    try {
      setPurchasingTicketId(ticket.id)
      const result = await purchase({
        quantity,
        eventTicket: {
          id: ticket.id,
        },
      })
      toast.success(`${quantity} ticket${quantity > 1 ? 's' : ''} purchased successfully!`)
      if (result) {
        onPurchaseSuccess?.(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to purchase ticket"
      toast.error(errorMessage)
    } finally {
      setPurchasingTicketId(null)
    }
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
      <div className="grid gap-3">
        {tickets.map((ticket) => {
          const available = ticket.totalQuantity - ticket.soldQuantity
          const isAvailable = available > 0

          return (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base">
                        {ticket.ticketType.name}
                      </CardTitle>
                      <Badge variant={isAvailable ? "default" : "destructive"}>
                        {available} / {ticket.totalQuantity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Price: ${ticket.price.toFixed(2)}</p>
                      <p>
                        Sold: {ticket.soldQuantity} / {ticket.totalQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground font-medium">Qty</label>
                      <Input
                        type="number"
                        min="1"
                        max={available}
                        value={quantities[ticket.id] || 1}
                        onChange={(e) => handleQuantityChange(ticket.id, e.target.value)}
                        disabled={!isAvailable || loading}
                        className="w-16 h-9"
                      />
                    </div>
                    <Button
                      onClick={() => handlePurchase(ticket)}
                      disabled={!isAvailable || loading || purchasingTicketId === ticket.id}
                      size="sm"
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {purchasingTicketId === ticket.id ? "Buying..." : "Buy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

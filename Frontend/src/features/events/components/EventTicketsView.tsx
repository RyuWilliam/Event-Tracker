import { useState } from "react"
import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Badge,
} from "@/shared/ui"
import {
  ShoppingCart,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react"
import { toast } from "sonner"
import type { EventTicket } from "../types/event.types"
import { useCart } from "@/features/cart"

interface TicketQuantityMap {
  [ticketId: number]: number
}

export function EventTicketsView({
  eventName = "Event",
  tickets,
}: {
  eventName?: string
  tickets: EventTicket[]
}) {
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<TicketQuantityMap>(() => {
    const initial: TicketQuantityMap = {}
    tickets.forEach((ticket) => {
      if (ticket.id != null) {
        initial[ticket.id] = 1
      }
    })
    return initial
  })

  const handleQuantityChange = (ticketId: number, value: string) => {
    const num = parseInt(value) || 1
    const ticket = tickets.find((t) => t.id === ticketId)
    const maxAvailable = ticket
      ? ticket.totalQuantity - ticket.soldQuantity
      : 0
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(1, Math.min(num, maxAvailable)),
    }))
  }

  const handleAddToCart = (ticket: EventTicket) => {
    const available = ticket.totalQuantity - ticket.soldQuantity
    const quantity = quantities[ticket.id!] || 1

    if (available <= 0) {
      toast.error("No tickets available for this type")
      return
    }

    addItem({
      eventTicketId: ticket.id!,
      eventName: eventName,
      ticketTypeName: ticket.ticketType.name,
      quantity,
      unitPrice: ticket.price,
      maxAvailable: available,
    })

    toast.success(
      `${quantity} ${quantity === 1 ? "ticket" : "tickets"} added to cart!`,
    )
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
          const available = (ticket.totalQuantity ?? 0) - (ticket.soldQuantity ?? 0)
          const isAvailable = available > 0

          return (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base">
                        {ticket.ticketType.name}
                      </CardTitle>
                      <Badge
                        className={
                          isAvailable
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-black text-white hover:bg-black/90"
                        }
                      >
                        {isAvailable ? "Available" : "Sold Out"}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-foreground space-y-1">
                      <p>Price: ${ticket.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={
                          !isAvailable ||
                          (quantities[ticket.id!] || 1) <= 1
                        }
                        onClick={() =>
                          handleQuantityChange(
                            ticket.id!,
                            String((quantities[ticket.id!] || 1) - 1),
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium select-none">
                        {quantities[ticket.id!] || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={
                          !isAvailable ||
                          (quantities[ticket.id!] || 1) >= available
                        }
                        onClick={() =>
                          handleQuantityChange(
                            ticket.id!,
                            String((quantities[ticket.id!] || 1) + 1),
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(ticket)}
                      disabled={!isAvailable}
                      size="lg"
                      className="gap-2 px-6"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
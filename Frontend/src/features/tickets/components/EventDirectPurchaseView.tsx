import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Minus,
  Plus,
  ShoppingBag,
  Ticket,
} from "lucide-react"
import { Badge, Button, Card, CardContent, CardTitle } from "@/shared/ui"
import { getEvent } from "@/features/events/services/eventsApi"
import { useTicketPurchase } from "../hooks/useTicketPurchase"
import type { DirectPurchaseSelection } from "../types/ticket.types"
import type { Event, EventTicket } from "@/features/events"

interface EventDirectPurchaseViewProps {
  eventId: number
}

type QuantityMap = Record<number, number>

function getAvailableQuantity(ticket: EventTicket): number {
  return Math.max(0, ticket.totalQuantity - ticket.soldQuantity)
}

function formatEventDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getPurchaseErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined
  const apiMessage = error instanceof Error ? error.message : ""

  if (status === 401 || status === 403) {
    return "Your session is no longer valid. Please sign in again and retry."
  }

  if (status === 409) {
    return apiMessage || "Ticket availability changed. Please review quantities and try again."
  }

  if (status === 400) {
    return apiMessage || "Invalid purchase request. Please review ticket quantities and retry."
  }

  if (status && status >= 500) {
    return "We could not complete your purchase due to a server issue. Please try again in a moment."
  }

  return apiMessage || "Purchase failed. Please try again."
}

export function EventDirectPurchaseView({ eventId }: EventDirectPurchaseViewProps) {
  const navigate = useNavigate()
  const { purchase, loading: purchasing } = useTicketPurchase()
  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<EventTicket[]>([])
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoadingData(true)
    setLoadError(null)

    try {
      const eventData = await getEvent(eventId)
      const ticketsData = Array.isArray(eventData.tickets) ? eventData.tickets : []

      setEvent(eventData)
      setTickets(ticketsData)
      setQuantities(
        ticketsData.reduce<QuantityMap>((acc: QuantityMap, ticket: EventTicket) => {
          if (ticket.id) {
            acc[ticket.id] = 0
          }
          return acc
        }, {}),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load event tickets"
      setLoadError(message)
    } finally {
      setLoadingData(false)
    }
  }, [eventId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedItems = useMemo<DirectPurchaseSelection[]>(() => {
    return tickets
      .filter((ticket) => Boolean(ticket.id) && (quantities[ticket.id!] ?? 0) > 0)
      .map((ticket) => ({
        eventTicketId: ticket.id!,
        quantity: quantities[ticket.id!] ?? 0,
        ticket,
      }))
  }, [tickets, quantities])

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.ticket.price,
    0,
  )
  const hasAvailableTickets = tickets.some((ticket) => getAvailableQuantity(ticket) > 0)
  const isEventPurchasable = event?.status === "ACTIVE"
  const canSubmitPurchase = Boolean(event) && isEventPurchasable && hasAvailableTickets && totalQuantity > 0 && !purchasing

  const handleQuantityDelta = (ticket: EventTicket, delta: number) => {
    if (!ticket.id) {
      return
    }

    const available = getAvailableQuantity(ticket)
    setQuantities((prev) => {
      const current = prev[ticket.id!] ?? 0
      const next = Math.max(0, Math.min(current + delta, available))
      return { ...prev, [ticket.id!]: next }
    })
  }

  const handlePurchase = async () => {
    if (!isEventPurchasable) {
      toast.error("This event is no longer available for purchase")
      return
    }

    if (!hasAvailableTickets) {
      toast.error("All tickets for this event are sold out")
      return
    }

    if (selectedItems.length === 0) {
      toast.error("Select at least one ticket before purchasing")
      return
    }

    try {
      const ticketResume = await purchase({
        items: selectedItems.map((item) => ({
          quantity: item.quantity,
          eventTicket: { id: item.eventTicketId },
        })),
      })

      const totalPurchased = ticketResume?.totalQuantity ?? totalQuantity
      toast.success(`Successfully purchased ${totalPurchased} ticket${totalPurchased > 1 ? "s" : ""}!`)
      navigate("/my-purchases")
    } catch (error) {
      toast.error(getPurchaseErrorMessage(error))
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center text-muted-foreground">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading purchase options...
        </div>
      </div>
    )
  }

  if (loadError || !event) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-semibold">Could not load this event</p>
            <p className="text-sm text-muted-foreground">{loadError ?? "Please try again."}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/events")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            <Button onClick={() => void loadData()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
          <p className="text-sm text-muted-foreground">Select ticket quantities and complete your purchase.</p>
          {!isEventPurchasable && (
            <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Ticket sales are closed because this event is currently {event.status.toLowerCase()}.
            </div>
          )}
        </CardContent>
      </Card>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            No tickets are available for this event.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
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
                          onClick={() => handleQuantityDelta(ticket, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{selected}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={soldOut || selected >= available || !isEventPurchasable}
                          onClick={() => handleQuantityDelta(ticket, 1)}
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

          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets selected yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.eventTicketId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span>{item.quantity}x {item.ticket.ticketType.name}</span>
                      </div>
                      <span>${(item.quantity * item.ticket.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total tickets</span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" disabled={!canSubmitPurchase} onClick={handlePurchase}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {purchasing ? "Processing..." : "Complete Purchase"}
              </Button>
              {!hasAvailableTickets && (
                <p className="text-sm text-muted-foreground">This event is sold out.</p>
              )}
              {!isEventPurchasable && (
                <p className="text-sm text-muted-foreground">Purchases are unavailable for this event status.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

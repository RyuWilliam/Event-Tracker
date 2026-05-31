import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button, Card, CardContent } from "@/shared/ui"
import { getEvent } from "@/features/events/services/eventsApi"
import type { DirectPurchaseSelection } from "../types/ticket.types"
import type { Event, EventTicket } from "@/features/events"
import { getAvailableQuantity } from "../utils/directPurchase"
import { EventDirectPurchaseHeader } from "./EventDirectPurchaseHeader"
import { TicketSelectionList } from "./TicketSelectionList"
import { DirectPurchaseSummaryCard } from "./DirectPurchaseSummaryCard"

interface EventDirectPurchaseViewProps {
  eventId: number
}

type QuantityMap = Record<number, number>

export function EventDirectPurchaseView({ eventId }: EventDirectPurchaseViewProps) {
  const navigate = useNavigate()
  const location = useLocation()
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
  const purchaseError =
    typeof location.state === "object" && location.state !== null && "purchaseError" in location.state
      ? String((location.state as { purchaseError?: string }).purchaseError ?? "")
      : ""

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

  const handlePurchaseClick = () => {
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

    navigate(`/events/${eventId}/confirm`, {
      state: {
        selectedItems,
        totalQuantity,
        totalAmount,
      },
    })
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

      <EventDirectPurchaseHeader event={event} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TicketSelectionList
          tickets={tickets}
          quantities={quantities}
          isEventPurchasable={isEventPurchasable}
          onQuantityChange={handleQuantityDelta}
        />

        <DirectPurchaseSummaryCard
          selectedItems={selectedItems}
          totalQuantity={totalQuantity}
          totalAmount={totalAmount}
          hasAvailableTickets={hasAvailableTickets}
          isEventPurchasable={isEventPurchasable}
          isPurchasing={false}
          onPurchase={handlePurchaseClick}
        />
      </div>

      {purchaseError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {purchaseError}
        </div>
      )}
    </div>
  )
}
import type { Event } from "@/features/events"
import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/shared/ui"
import { formatEventDate } from "../utils/directPurchase"

interface EventDirectPurchaseHeaderProps {
  event: Event
}

export function EventDirectPurchaseHeader({ event }: EventDirectPurchaseHeaderProps) {
  const isEventPurchasable = event.status === "ACTIVE"

  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatEventDate(event.date)}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
        <p className="text-sm text-muted-foreground">
          Select ticket quantities and complete your purchase.
        </p>
        {!isEventPurchasable && (
          <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Ticket sales are closed because this event is currently {event.status.toLowerCase()}.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
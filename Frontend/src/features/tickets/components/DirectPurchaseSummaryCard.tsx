import { Ticket, ShoppingBag } from "lucide-react"
import { Button, Card, CardContent } from "@/shared/ui"
import type { DirectPurchaseSelection } from "../types/ticket.types"

interface DirectPurchaseSummaryCardProps {
  selectedItems: DirectPurchaseSelection[]
  totalQuantity: number
  totalAmount: number
  hasAvailableTickets: boolean
  isEventPurchasable: boolean
  isPurchasing: boolean
  onPurchase: () => void
}

export function DirectPurchaseSummaryCard({
  selectedItems,
  totalQuantity,
  totalAmount,
  hasAvailableTickets,
  isEventPurchasable,
  isPurchasing,
  onPurchase,
}: DirectPurchaseSummaryCardProps) {
  const canSubmitPurchase =
    isEventPurchasable && hasAvailableTickets && totalQuantity > 0 && !isPurchasing

  return (
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

        <Button className="w-full" disabled={!canSubmitPurchase} onClick={onPurchase}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isPurchasing ? "Processing..." : "Complete Purchase"}
        </Button>

        {!hasAvailableTickets && (
          <p className="text-sm text-muted-foreground">This event is sold out.</p>
        )}

        {!isEventPurchasable && (
          <p className="text-sm text-muted-foreground">
            Purchases are unavailable for this event status.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
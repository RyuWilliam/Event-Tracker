import { useState } from "react"
import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui";
import {
  ShoppingCart,
  AlertCircle,
  Plus,
  Minus,
  Calendar,
  Ticket,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"
import type { EventTicket } from "../types/event.types"
import { useCart } from "@/features/cart"

export interface EventTicketsViewProps {
  eventName?: string
  tickets: EventTicket[]
  onPurchaseSuccess?: (r: any) => void
}

interface TicketQuantityMap {
  [ticketId: number]: number
}

export function EventTicketsView({
  eventName = "Event",
  tickets,
  onPurchaseSuccess,
}: EventTicketsViewProps) {
  const { addItem } = useCart();
  const [purchasingTicketId, setPurchasingTicketId] = useState<number | null>(
    null,
  );
  const [confirmingTicket, setConfirmingTicket] = useState<EventTicket | null>(
    null,
  );
  const [quantities, setQuantities] = useState<TicketQuantityMap>(
    tickets.reduce((acc: TicketQuantityMap, ticket: EventTicket) => ({ ...acc, [ticket.id!]: 1 }), {}),
  );

  const handleQuantityChange = (ticketId: number, value: string) => {
    const num = parseInt(value) || 1
    const ticket = tickets.find((t: EventTicket) => t.id === ticketId)
    const maxAvailable = ticket
      ? ticket.totalQuantity - ticket.soldQuantity
      : 0
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(1, Math.min(num, maxAvailable)),
    }))
  }

  const handleOpenConfirm = (ticket: EventTicket) => {
    const available = ticket.totalQuantity - ticket.soldQuantity
    const quantity = quantities[ticket.id!] || 1

    if (available <= 0) {
      toast.error("No tickets available for this type");
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [ticket.id!]: quantity,
    }));

    setConfirmingTicket(ticket);
  };

  const handlePurchase = async () => {
    if (!confirmingTicket) return;
    const ticket = confirmingTicket;

    const available = ticket.totalQuantity - ticket.soldQuantity;
    const quantity = quantities[ticket.id!] || 1;

    if (available <= 0 || quantity > available) {
      toast.error("Not enough tickets available");
      setConfirmingTicket(null);
      return;
    }

    try {
      setPurchasingTicketId(ticket.id!);
      addItem({
        eventTicketId: ticket.id!,
        eventName,
        ticketTypeName: ticket.ticketType.name,
        quantity,
        unitPrice: ticket.price,
        maxAvailable: available,
      });
      toast.success(
        `${quantity} ticket${quantity > 1 ? "s" : ""} added to cart successfully!`,
      );
      setConfirmingTicket(null);
      if (onPurchaseSuccess) {
        onPurchaseSuccess({ ticket, quantity });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add to cart";
      toast.error(errorMessage);
    } finally {
      setPurchasingTicketId(null);
    }
  };

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
            <Card key={ticket.id!} className="overflow-hidden">
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
                      onClick={() => handleOpenConfirm(ticket)}
                      disabled={
                        !isAvailable ||
                        purchasingTicketId === ticket.id!
                      }
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

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmingTicket}
        onOpenChange={(open) => !open && setConfirmingTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Please review the details of your ticket purchase below.
            </DialogDescription>
          </DialogHeader>
          {confirmingTicket && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 text-primary font-medium items-center">
                    <Calendar className="h-5 w-5" />
                    <span>{eventName}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>Type:</span>
                  </div>
                  <span className="font-medium">
                    {confirmingTicket.ticketType.name}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground flex items-center">
                    Quantity:
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-muted-foreground/30 hover:bg-muted/50"
                      disabled={
                        (quantities[confirmingTicket.id!!] || 1) <= 1
                      }
                      onClick={() =>
                        handleQuantityChange(
                          confirmingTicket.id!!,
                          String((quantities[confirmingTicket.id!!] || 1) - 1),
                        )
                      }
                    >
                      <Minus className="h-4 w-4 text-foreground" />
                    </Button>
                    <span className="w-6 text-center font-medium select-none text-base">
                      {quantities[confirmingTicket.id!!] || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-muted-foreground/30 hover:bg-muted/50"
                      disabled={
                        (quantities[confirmingTicket.id!!] || 1) >=
                          confirmingTicket.totalQuantity -
                            confirmingTicket.soldQuantity
                      }
                      onClick={() =>
                        handleQuantityChange(
                          confirmingTicket.id!!,
                          String((quantities[confirmingTicket.id!!] || 1) + 1),
                        )
                      }
                    >
                      <Plus className="h-4 w-4 text-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground">Unit Price:</div>
                  <span className="font-medium">
                    ${confirmingTicket.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border mt-3">
                  <div className="text-base font-semibold flex items-center text-foreground">
                    <DollarSign className="h-5 w-5 mr-1" /> Total to pay
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-500">
                    $
                    {(
                      (quantities[confirmingTicket.id!!] || 1) *
                      confirmingTicket.price
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  By confirming this purchase, you agree that your tickets are
                  non-refundable and subject to the event organizer's terms and
                  conditions.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmingTicket(null)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePurchase}
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
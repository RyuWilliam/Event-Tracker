import { useLocation, useNavigate, useParams } from "react-router"
import { AlertCircle, ArrowLeft, Ticket } from "lucide-react"
import { toast } from "sonner"
import { MainLayout } from "@/core/layouts/MainLayout"
import { Button, Card, CardContent } from "@/shared/ui"
import { useTicketPurchase } from "../hooks/useTicketPurchase"
import type { DirectPurchaseSelection, PaymentDetails } from "../types/ticket.types"
import { getPurchaseErrorMessage } from "../utils/directPurchase"
import { ConfirmPurchaseForm } from "../components/ConfirmPurchaseForm"
import { useAuth } from "@/features/auth"

interface ConfirmPurchaseState {
  selectedItems: DirectPurchaseSelection[]
  totalQuantity: number
  totalAmount: number
}

export function ConfirmPurchasePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { purchase, loading: purchasing } = useTicketPurchase()
  const { userEmail } = useAuth()

  const parsedEventId = Number(eventId)
  const state = location.state as ConfirmPurchaseState | undefined
  const hasState = Boolean(state && state.selectedItems && state.selectedItems.length > 0)

  if (!eventId || Number.isNaN(parsedEventId) || parsedEventId <= 0) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Invalid event id.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!hasState) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">No purchase details found</p>
                <p className="text-sm">Please return to ticket selection and try again.</p>
              </div>
              <Button onClick={() => navigate(`/events/${parsedEventId}/purchase`)}>
                Back to Ticket Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!userEmail) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">We could not read your email</p>
                <p className="text-sm">Please sign in again and retry your purchase.</p>
              </div>
              <Button onClick={() => navigate(`/events/${parsedEventId}/purchase`)}>
                Back to Ticket Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const confirmedState = state as ConfirmPurchaseState
  const selectedItems: DirectPurchaseSelection[] = confirmedState.selectedItems
  const { totalQuantity, totalAmount } = confirmedState
  const formId = "confirm-purchase-form"

  const handleConfirmPayment = async (paymentDetails: PaymentDetails) => {
    try {
      const ticketResume = await purchase({
        payment: paymentDetails,
        items: selectedItems.map((item) => ({
          quantity: item.quantity,
          eventTicket: { id: item.eventTicketId },
        })),
      })

      const totalPurchased = ticketResume?.totalQuantity ?? totalQuantity
      toast.success(`Successfully purchased ${totalPurchased} ticket${totalPurchased > 1 ? "s" : ""}!`)
      navigate("/my-purchases")
    } catch (error) {
      const message = getPurchaseErrorMessage(error)
      navigate(`/events/${parsedEventId}/purchase`, {
        state: { purchaseError: message },
      })
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(`/events/${parsedEventId}/purchase`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ticket Selection
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <p className="text-sm text-muted-foreground">
                Select card type first, then complete the required fields.
              </p>
              <ConfirmPurchaseForm
                formId={formId}
                onConfirm={handleConfirmPayment}
                userEmail={userEmail}
                isPurchasing={purchasing}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Confirm Purchase</h2>
              <p className="text-sm text-muted-foreground">
                Review your tickets before entering payment details.
              </p>

              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.eventTicketId}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {item.quantity}x {item.ticket.ticketType.name}
                      </span>
                    </div>
                    <span>${(item.quantity * item.ticket.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

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

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  form={formId}
                  disabled={purchasing}
                  className="w-full"
                >
                  {purchasing ? "Processing..." : `Confirm Purchase $${totalAmount.toFixed(2)}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${parsedEventId}/purchase`)}
                  disabled={purchasing}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {purchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </MainLayout>
  )
}

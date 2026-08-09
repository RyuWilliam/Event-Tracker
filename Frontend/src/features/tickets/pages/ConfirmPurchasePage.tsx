import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Ticket, XCircle } from "lucide-react"
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

type PaymentPhase = "idle" | "waiting" | "done"

interface FinalStatus {
  status: "APPROVED" | "REJECTED" | "FAILED"
  userMessage: string
}

export function ConfirmPurchasePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { purchase } = useTicketPurchase()
  const { userEmail } = useAuth()

  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle")
  const [finalStatus, setFinalStatus] = useState<FinalStatus | null>(null)
  const purchasedQuantityRef = useRef<number>(0)

  const parsedEventId = Number(eventId)
  const state = location.state as ConfirmPurchaseState | undefined
  const hasState = Boolean(state?.selectedItems?.length)

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
    setPaymentPhase("waiting")
    setFinalStatus(null)

    try {
      const ticketResume = await purchase({
        payment: paymentDetails,
        items: selectedItems.map((item) => ({
          quantity: item.quantity,
          eventTicket: { id: item.eventTicketId },
        })),
      })

      purchasedQuantityRef.current = ticketResume?.totalQuantity ?? totalQuantity
      setFinalStatus({ status: "APPROVED", userMessage: "¡Pago aprobado!" })
      setPaymentPhase("done")

    } catch (error) {
      const message = getPurchaseErrorMessage(error)
      setFinalStatus({ status: "REJECTED", userMessage: message })
      setPaymentPhase("done")
    }
  }

  useEffect(() => {
    if (!finalStatus || finalStatus.status !== "APPROVED") return

    const qty = purchasedQuantityRef.current
    toast.success(`Successfully purchased ${qty} ticket${qty !== 1 ? "s" : ""}!`)
    const timer = setTimeout(() => navigate("/my-purchases"), 2000)
    return () => clearTimeout(timer)
  }, [finalStatus, navigate])

  const isProcessing = paymentPhase === "waiting"

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${parsedEventId}/purchase`)}
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ticket Selection
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Formulario de pago */}
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
                isPurchasing={isProcessing}
              />
            </CardContent>
          </Card>

          {/* Resumen de boletas */}
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
                      <span>{item.quantity}x {item.ticket.ticketType.name}</span>
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
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Confirm Purchase $${totalAmount.toFixed(2)}`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${parsedEventId}/purchase`)}
                  disabled={isProcessing}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status */}
        {paymentPhase !== "idle" && (
          <Card className={
            finalStatus?.status === "APPROVED"
              ? "border-green-500"
              : finalStatus
              ? "border-destructive"
              : ""
          }>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Payment Status</h2>
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {finalStatus?.status === "APPROVED" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {finalStatus && finalStatus.status !== "APPROVED" && <XCircle className="h-4 w-4 text-destructive" />}
              </div>

              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando pago, por favor espera...</span>
                </div>
              )}

              {finalStatus?.status === "APPROVED" && (
                <p className="text-sm text-green-600 font-medium">
                  ¡Pago exitoso! Redirigiendo a tus compras...
                </p>
              )}

              {finalStatus && finalStatus.status !== "APPROVED" && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-destructive font-medium mb-2">
                    {finalStatus.userMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentPhase("idle")
                      setFinalStatus(null)
                    }}
                  >
                    Try again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
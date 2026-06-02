import { useCallback, useEffect, useMemo, useState } from "react"
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
import { usePaymentWebSocket, type PaymentStatusMessage } from "../hooks/usePaymentWebSocket"

interface ConfirmPurchaseState {
  selectedItems: DirectPurchaseSelection[]
  totalQuantity: number
  totalAmount: number
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

function resolveUserIdFromToken(token: string | null): string | null {
  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }

  const candidate = payload.userId ?? payload.user_id ?? payload.id ?? payload.sub
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return String(candidate)
  }
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate
  }

  return null
}

function isFinalPaymentStatus(status: string): boolean {
  return ["APPROVED", "REJECTED", "FAILED"].includes(status.toUpperCase())
}

export function ConfirmPurchasePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { purchase, loading: purchasing } = useTicketPurchase()
  const { userEmail, token } = useAuth()
  const [paymentUpdates, setPaymentUpdates] = useState<string[]>([])
  const [finalStatus, setFinalStatus] = useState<PaymentStatusMessage | null>(null)

  const socketUserId = useMemo(() => resolveUserIdFromToken(token), [token])

  const handlePaymentMessage = useCallback((message: PaymentStatusMessage) => {
    const normalizedStatus = message.status?.toUpperCase() ?? "UNKNOWN"
    const isFinal = isFinalPaymentStatus(normalizedStatus)
    const trimmedMessage = message.userMessage?.trim()

    setPaymentUpdates((prev) => {
      const next = [...prev]

      if (trimmedMessage && !next.includes(trimmedMessage)) {
        next.push(trimmedMessage)
      }

      if (isFinal) {
        const finalLine = `Resultado final: ${normalizedStatus}${trimmedMessage ? ` - ${trimmedMessage}` : ""}`
        if (!next.includes(finalLine)) {
          next.push(finalLine)
        }
      }

      return next
    })

    if (isFinal) {
      setFinalStatus({ ...message, status: normalizedStatus })
    }
  }, [])

  const { connect, disconnect } = usePaymentWebSocket({
    userId: socketUserId,
    onMessage: handlePaymentMessage,
  })

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
      setPaymentUpdates(["Enviando solicitud de pago..."])
      setFinalStatus(null)
      connect()

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
      disconnect()
      const message = getPurchaseErrorMessage(error)
      navigate(`/events/${parsedEventId}/purchase`, {
        state: { purchaseError: message },
      })
    }
  }

  useEffect(() => {
    if (finalStatus) {
      disconnect()
    }
  }, [finalStatus, disconnect])

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

        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Payment Progress</h2>
            {paymentUpdates.length > 0 ? (
              <ol className="space-y-2 text-sm text-muted-foreground">
                {paymentUpdates.map((line, index) => (
                  <li key={`${line}-${index}`} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-xs">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No payment updates yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {purchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </MainLayout>
  )
}

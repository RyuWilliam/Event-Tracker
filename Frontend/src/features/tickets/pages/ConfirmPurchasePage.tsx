import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  const candidate = payload.userId ?? payload.user_id ?? payload.id ?? payload.sub
  if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate)
  if (typeof candidate === "string" && candidate.trim().length > 0) return candidate
  return null
}


function isFinalPaymentStatus(status: string): boolean {
  return ["APPROVED", "REJECTED", "FAILED"].includes(status.toUpperCase())
}


type PaymentPhase = "idle" | "waiting" | "done"


export function ConfirmPurchasePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { purchase } = useTicketPurchase()
  const { userEmail, token } = useAuth()

  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle")
  const [paymentUpdates, setPaymentUpdates] = useState<PaymentStatusMessage[]>([])
  const [finalStatus, setFinalStatus] = useState<PaymentStatusMessage | null>(null)
  const purchasedQuantityRef = useRef<number>(0)

  const socketUserId = useMemo(() => resolveUserIdFromToken(token), [token])

  const handlePaymentMessage = useCallback((message: PaymentStatusMessage) => {
    const normalizedStatus = message.status?.toUpperCase() ?? "UNKNOWN"
    const normalized: PaymentStatusMessage = { ...message, status: normalizedStatus }

    setPaymentUpdates((prev) => [...prev, normalized])

    if (isFinalPaymentStatus(normalizedStatus)) {
      setFinalStatus(normalized)
      setPaymentPhase("done")
    }
  }, [])

  const { connect, disconnect } = usePaymentWebSocket({
    userId: socketUserId,
    onMessage: handlePaymentMessage,
  })

  const parsedEventId = Number(eventId)
  const state = location.state as ConfirmPurchaseState | undefined
  const hasState = Boolean(state?.selectedItems?.length)

  // Early returns para estados inválidos
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
      setPaymentUpdates([])
      setFinalStatus(null)
      setPaymentPhase("waiting")

      // Conectar WebSocket ANTES de hacer el pago
      connect()

      setPaymentUpdates([{
        status: "PROCESSING",
        userMessage: "Enviando solicitud de pago...",
      } as PaymentStatusMessage])

      const ticketResume = await purchase({
        payment: paymentDetails,
        items: selectedItems.map((item) => ({
          quantity: item.quantity,
          eventTicket: { id: item.eventTicketId },
        })),
      })

      purchasedQuantityRef.current = ticketResume?.totalQuantity ?? totalQuantity

      // NO navegar aquí: esperar a que el WebSocket entregue el estado final
    } catch (error) {
      disconnect()
      setPaymentPhase("idle")
      const message = getPurchaseErrorMessage(error)
      navigate(`/events/${parsedEventId}/purchase`, {
        state: { purchaseError: message },
      })
    }
  }

  // Efecto: cuando llega el estado final, desconectar y navegar si fue aprobado
  useEffect(() => {
    if (!finalStatus) return

    disconnect()

    const status = finalStatus.status.toUpperCase()

    if (status === "APPROVED") {
      const qty = purchasedQuantityRef.current
      toast.success(`Successfully purchased ${qty} ticket${qty !== 1 ? "s" : ""}!`)
      // Pequeño delay para que el usuario vea el estado final antes de navegar
      const timer = setTimeout(() => navigate("/my-purchases"), 2000)
      return () => clearTimeout(timer)
    }
  }, [finalStatus, disconnect, navigate])

  // Helper para ícono/color por status
  const getStatusMeta = (status: string) => {
    const s = status.toUpperCase()
    if (s === "APPROVED") return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: "text-green-600" }
    if (["REJECTED", "FAILED"].includes(s)) return { icon: <XCircle className="h-4 w-4 text-destructive" />, color: "text-destructive" }
    return { icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />, color: "text-muted-foreground" }
  }

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

        {/* Payment Status - solo se muestra si ya se inició el pago */}
        {paymentPhase !== "idle" && (
          <Card className={finalStatus?.status === "APPROVED" ? "border-green-500" : finalStatus ? "border-destructive" : ""}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Payment Status</h2>
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {finalStatus?.status === "APPROVED" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {finalStatus && finalStatus.status !== "APPROVED" && <XCircle className="h-4 w-4 text-destructive" />}
              </div>

              {paymentUpdates.length > 0 ? (
                <ol className="space-y-2 text-sm">
                  {paymentUpdates.map((update, index) => {
                    const { icon, color } = getStatusMeta(update.status ?? "")
                    return (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">{icon}</span>
                        <span className={color}>
                          {update.userMessage ?? update.status}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to payment service...</span>
                </div>
              )}

              {/* Mensaje final si fue rechazado: opción de reintentar */}
              {finalStatus && finalStatus.status !== "APPROVED" && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-destructive font-medium mb-2">
                    {finalStatus.userMessage ?? "Payment could not be completed."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentPhase("idle")
                      setPaymentUpdates([])
                      setFinalStatus(null)
                    }}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {/* Mensaje de éxito con redirect countdown */}
              {finalStatus?.status === "APPROVED" && (
                <p className="text-sm text-green-600 font-medium">
                  ¡Pago exitoso! Redirigiendo a tus compras...
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
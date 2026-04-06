import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardTitle, Button, Badge } from "@/shared/ui"
import { QrCode, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useTicketPurchase } from "../hooks/useTicketPurchase"
import { QrDialog } from "./QrDialog"
import type { TicketResume } from "../types/ticket.types"

interface SelectedPurchaseWithId extends TicketResume {
  displayId: number
}

export function MyPurchasesView() {
  const navigate = useNavigate()
  const { getTicketResumes, loading, error } = useTicketPurchase()
  const [purchases, setPurchases] = useState<TicketResume[]>([])
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<SelectedPurchaseWithId | null>(null)

  const loadPurchases = async () => {
    try {
      const result = await getTicketResumes()
      setPurchases(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load purchases"
      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  const handleShowQr = (purchase: TicketResume, index: number) => {
    setSelectedPurchase({
      ...purchase,
      displayId: purchase.id || index,
    })
    setQrDialogOpen(true)
  }

  if (loading && purchases.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center p-12">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading your purchases...
          </div>
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center p-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>No tickets purchased yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">My Tickets</h2>
        </div>
        <Button onClick={loadPurchases} disabled={loading} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {purchases.map((purchase, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{purchase.eventName}</CardTitle>
                    <Badge variant="secondary">{purchase.type.name}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>💰 Total: ${purchase.total.toFixed(2)}</p>
                    <p>🎫 Quantity: {purchase.quantity}</p>
                    <p>📍 {purchase.userAddress}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleShowQr(purchase, index)}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Show QR
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedPurchase && (
        <QrDialog
          open={qrDialogOpen}
          purchaseId={selectedPurchase.displayId}
          ticketType={selectedPurchase.type.name}
          eventName={selectedPurchase.eventName}
          onOpenChange={setQrDialogOpen}
        />
      )}
    </div>
  )
}

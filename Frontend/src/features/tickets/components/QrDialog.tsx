import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { AlertCircle, Download } from "lucide-react"
import { useTicketPurchase } from "../hooks/useTicketPurchase"

interface QrDialogProps {
  open: boolean
  purchaseId: number | null
  ticketType: string
  eventName: string
  onOpenChange: (open: boolean) => void
}

export function QrDialog({
  open,
  purchaseId,
  ticketType,
  eventName,
  onOpenChange,
}: QrDialogProps) {
  const { getQrImage } = useTicketPurchase()
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !purchaseId) {
      setQrUrl(null)
      return
    }

    const loadQr = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = await getQrImage(purchaseId)
        setQrUrl(url)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load QR"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadQr()

    return () => {
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, purchaseId])

  const handleDownload = () => {
    if (!qrUrl) return

    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `ticket-${purchaseId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Event:</strong> {eventName}
            </p>
            <p>
              <strong>Type:</strong> {ticketType}
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {qrUrl && !loading && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <img src={qrUrl} alt="Ticket QR Code" className="w-64 h-64" />
              </div>
              <Button onClick={handleDownload} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

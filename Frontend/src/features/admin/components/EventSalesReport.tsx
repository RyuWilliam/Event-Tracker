import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Card, CardContent } from "@/shared/ui"
import { X } from "lucide-react"
import type { Event } from "@/features/events/types/event.types"

interface EventSalesReportProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventSalesReport({ event, open, onOpenChange }: EventSalesReportProps) {
  if (!event) return null

  const totalTickets = event.tickets?.reduce((sum, t) => sum + t.totalQuantity, 0) || 0
  const totalSold = event.tickets?.reduce((sum, t) => sum + t.soldQuantity, 0) || 0
  const totalRevenue = event.tickets?.reduce((sum, t) => sum + t.price * t.soldQuantity, 0) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle>{event.name} - Sales Report</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
                  <p className="text-2xl font-bold">{totalTickets}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Sold</p>
                  <p className="text-2xl font-bold text-green-600">{totalSold}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Ticket Type</th>
                  <th className="text-right py-2 px-3 font-semibold">Price</th>
                  <th className="text-right py-2 px-3 font-semibold">Sold</th>
                  <th className="text-right py-2 px-3 font-semibold">Available</th>
                  <th className="text-right py-2 px-3 font-semibold">Total</th>
                  <th className="text-right py-2 px-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {event.tickets && event.tickets.length > 0 ? (
                  event.tickets.map((ticket) => {
                    const available = ticket.totalQuantity - ticket.soldQuantity
                    const revenue = ticket.price * ticket.soldQuantity
                    const percentSold = Math.round((ticket.soldQuantity / ticket.totalQuantity) * 100)

                    return (
                      <tr key={ticket.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3 font-medium">{ticket.ticketType?.name}</td>
                        <td className="text-right py-3 px-3">${ticket.price.toFixed(2)}</td>
                        <td className="text-right py-3 px-3">
                          <span className="font-semibold text-green-600">{ticket.soldQuantity}</span>
                          <span className="text-xs text-muted-foreground ml-1">({percentSold}%)</span>
                        </td>
                        <td className="text-right py-3 px-3 text-muted-foreground">{available}</td>
                        <td className="text-right py-3 px-3 text-muted-foreground">{ticket.totalQuantity}</td>
                        <td className="text-right py-3 px-3 font-semibold text-blue-600">
                          ${revenue.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      No tickets configured for this event
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="text-lg font-semibold">📅 {event.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{event.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventSalesReport

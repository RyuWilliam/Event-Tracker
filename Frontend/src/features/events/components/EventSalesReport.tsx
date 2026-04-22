import { Dialog, DialogContent, DialogHeader, DialogTitle, Card, CardContent } from "@/shared/ui"
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
  const percentageSold = totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-background">
        <div className="bg-muted/30 px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            📊 {event.name} <span className="text-muted-foreground font-normal text-base">- Sales Report</span>
          </DialogTitle>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-8">
          {/* Top Metrics - 3 Horizontal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-muted">
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Entries</span>
                  <span className="text-3xl font-bold tracking-tight">{totalTickets.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-green-100 bg-green-50/30">
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-green-700 uppercase tracking-wider">Tickets Sold</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-700 tracking-tight">{totalSold.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-blue-200 bg-blue-100">
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-black uppercase tracking-wider">Total Revenue</span>
                  <span className="text-3xl font-bold text-black tracking-tight">
                    ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Detailed Breakdown</h3>
            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-semibold text-muted-foreground">Type</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground">Price</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground">Sold</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground">Available</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground">Total</th>
                    <th className="h-10 px-4 text-right align-middle font-semibold text-muted-foreground">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y relative">
                  {event.tickets && event.tickets.length > 0 ? (
                    event.tickets.map((ticket) => {
                      const available = ticket.totalQuantity - ticket.soldQuantity
                      const revenue = ticket.price * ticket.soldQuantity
                      const percentSold = ticket.totalQuantity > 0 ? Math.round((ticket.soldQuantity / ticket.totalQuantity) * 100) : 0

                      return (
                        <tr key={ticket.id} className="transition-colors hover:bg-muted/30">
                          <td className="p-4 align-middle font-medium">{ticket.ticketType?.name}</td>
                          <td className="p-4 align-middle text-right text-muted-foreground">
                            ${ticket.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold text-green-600">{ticket.soldQuantity.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right text-muted-foreground">{available.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right text-muted-foreground">{ticket.totalQuantity.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right font-medium text-blue-600">
                            ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="h-24 text-center align-middle text-muted-foreground">
                        No tickets configured for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventSalesReport

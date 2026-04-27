import { useParams } from "react-router"
import { MainLayout } from "@/core/layouts/MainLayout"
import { Card, CardContent } from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import { EventDirectPurchaseView } from "../components/EventDirectPurchaseView"

export function EventDirectPurchasePage() {
  const { eventId } = useParams()
  const parsedEventId = Number(eventId)

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

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <EventDirectPurchaseView eventId={parsedEventId} />
      </div>
    </MainLayout>
  )
}

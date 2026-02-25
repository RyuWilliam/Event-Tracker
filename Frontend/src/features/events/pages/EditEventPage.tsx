import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"
import { Button, Card, CardContent, H1 } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useEvent, useUpdateEvent } from "../hooks/useEvent"
import type { CreateEventPayload } from "../types/event.types"

export function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const eventId = Number(id)
  
  const { event, isLoading: isLoadingEvent, error: eventError } = useEvent(eventId)
  const { updateEvent, isLoading: isUpdating, error: updateError, isSuccess, reset } = useUpdateEvent(eventId)

  const handleSubmit = async (data: CreateEventPayload): Promise<void> => {
    await updateEvent(data)
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success("Event updated successfully!")
      reset()
    }
  }, [isSuccess, reset])

  useEffect(() => {
    if (updateError) {
      toast.error(updateError)
    }
  }, [updateError])

  if (isLoadingEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/admin/events">Back</Link>
          </Button>
          <H1>Edit Event</H1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading event...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (eventError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/admin/events">Back</Link>
          </Button>
          <H1>Edit Event</H1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error: {eventError}</p>
            <Button variant="outline" asChild className="mt-2">
              <Link to="/admin/events">Go back to events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/events">Back</Link>
        </Button>
        <H1>Edit Event</H1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            initialData={event || undefined}
            submitLabel="Update Event"
          />
        </CardContent>
      </Card>
    </div>
  )
}

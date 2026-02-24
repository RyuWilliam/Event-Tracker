import { useEffect } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button, Card, CardContent, H1 } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useCreateEvent } from "../hooks/useCreateEvent"
import type { CreateEventPayload } from "../types/event.types"

export function CreateEventPage() {
  const { createEvent, isLoading, error, isSuccess, reset } = useCreateEvent()

  const handleSubmit = async (data: CreateEventPayload): Promise<void> => {
    const success = await createEvent(data)
    if (!success && !error) {
      // Validation failed but error state not set - shouldn't happen but safety net
    }
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success("Event created successfully!")
      reset()
    }
  }, [isSuccess, reset])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/events">Back</Link>
        </Button>
        <H1>Create Event</H1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}

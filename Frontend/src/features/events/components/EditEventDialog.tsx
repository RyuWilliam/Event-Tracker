import { useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useEvent, useUpdateEvent } from "../hooks/useEvent"
import type { CreateEventPayload } from "../types/event.types"

interface EditEventDialogProps {
  eventId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditEventDialog({ eventId, open, onOpenChange, onSuccess }: EditEventDialogProps) {
  const { event, isLoading: isLoadingEvent, error: eventError } = useEvent(eventId ?? 0)
  const { updateEvent, isLoading: isUpdating, error: updateError, isSuccess, reset } = useUpdateEvent(eventId ?? 0)

  const handleSubmit = async (data: CreateEventPayload): Promise<void> => {
    await updateEvent(data)
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success("Event updated successfully!")
      reset()
      onOpenChange(false)
      onSuccess?.()
    }
  }, [isSuccess, reset, onOpenChange, onSuccess])

  useEffect(() => {
    if (updateError) {
      toast.error(updateError)
    }
  }, [updateError])

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoadingEvent ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        ) : eventError ? (
          <div className="py-8 text-center">
            <p className="text-destructive">Error: {eventError}</p>
          </div>
        ) : (
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            initialData={event || undefined}
            submitLabel="Update Event"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
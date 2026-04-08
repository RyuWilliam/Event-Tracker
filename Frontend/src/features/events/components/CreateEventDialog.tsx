import { toast } from "sonner"
import { Dialog, DialogContent } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useCreateEvent } from "../hooks/useCreateEvent"
import type { CreateEventPayload } from "../types/event.types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const { createEvent, isLoading, error, isSuccess, reset } = useCreateEvent()

  const handleSubmit = async (data: CreateEventPayload) => {
    await createEvent(data)
  }

  const handleSuccess = () => {
    toast.success("Event created successfully!")
    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  if (isSuccess) {
    handleSuccess()
  }

  if (error) {
    toast.error(error)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Event"
        />
      </DialogContent>
    </Dialog>
  )
}
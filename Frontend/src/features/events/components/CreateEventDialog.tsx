import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useCreateEvent } from "../hooks/useCreateEvent"
import { uploadEventImage } from "../services/eventsApi"
import type { CreateEventPayload } from "../types/event.types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const { createEvent, isLoading, error, isSuccess, reset } = useCreateEvent()
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const handleSubmit = async (data: CreateEventPayload) => {
    const createdEvent = await createEvent(data)

    if (createdEvent && selectedImageFile) {
      try {
        await uploadEventImage(createdEvent.id!, selectedImageFile)
        toast.success("Image uploaded successfully!")
      } catch (err) {
        toast.error("Event created but failed to upload image")
      }
    }
  }

  const handleSuccess = () => {
    toast.success("Event created successfully!")
    reset()
    setSelectedImageFile(null)
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
          selectedImageFile={selectedImageFile}
          onImageFileChange={setSelectedImageFile}
          submitLabel="Create Event"
        />
      </DialogContent>
    </Dialog>
  )
}
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useEvent, useUpdateEvent } from "../hooks/useEvent"
import { uploadEventImage, deleteEventImage } from "../services/eventsApi"
import { getImageBaseUrl } from "@/lib/apiConfig"
import type { CreateEventPayload } from "../types/event.types"

interface EditEventDialogProps {
  eventId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditEventDialog({ eventId, open, onOpenChange, onSuccess }: EditEventDialogProps) {
  const validEventId = eventId && eventId > 0 ? eventId : null
  const { event, isLoading: isLoadingEvent, error: eventError } = useEvent(validEventId ?? 0)
  const { updateEvent, isLoading: isUpdating, error: updateError, isSuccess, reset } = useUpdateEvent(validEventId ?? 0)

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (event?.imageUrl) {
      setImagePreview(`${getImageBaseUrl()}${event.imageUrl}`)
    } else {
      setImagePreview(null)
    }
    setSelectedImageFile(null)
  }, [event])

  const handleImageFileChange = (file: File | null) => {
    setSelectedImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (data: CreateEventPayload) => {
    const success = await updateEvent(data)

    if (success && selectedImageFile && validEventId) {
      try {
        await uploadEventImage(validEventId, selectedImageFile)
        toast.success("Image uploaded successfully")
      } catch (err) {
        toast.error("Event updated but failed to upload image")
      }
    }
  }

  const handleDeleteImage = async () => {
    if (!validEventId) return

    try {
      await deleteEventImage(validEventId)
      setImagePreview(null)
      setSelectedImageFile(null)
      toast.success("Image deleted successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete image"
      toast.error(message)
    }
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
      setImagePreview(event?.imageUrl ? `${getImageBaseUrl()}${event.imageUrl}` : null)
      setSelectedImageFile(null)
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
            selectedImageFile={selectedImageFile}
            onImageFileChange={handleImageFileChange}
            imagePreview={imagePreview}
            onImagePreviewChange={setImagePreview}
            onDeleteImage={validEventId ? handleDeleteImage : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

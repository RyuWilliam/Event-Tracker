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
  const { event, isLoading: isLoadingEvent, error: eventError } = useEvent(eventId ?? 0)
  const { updateEvent, isLoading: isUpdating, error: updateError, isSuccess, reset } = useUpdateEvent(eventId ?? 0)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (event?.imageUrl) {
      setImagePreview(`${getImageBaseUrl()}${event.imageUrl}`)
    } else {
      setImagePreview(null)
    }
  }, [event])

  const handleSubmit = async (data: CreateEventPayload): Promise<void> => {
    await updateEvent(data)
  }

  const handleUploadImage = async (file: File) => {
    if (!eventId) return

    setIsUploading(true)
    try {
      const result = await uploadEventImage(eventId, file)
      setImagePreview(`${getImageBaseUrl()}${result.imageUrl}`)
      toast.success("Image uploaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!eventId) return

    setIsUploading(true)
    try {
      await deleteEventImage(eventId)
      setImagePreview(null)
      toast.success("Image deleted successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete image"
      toast.error(message)
      throw err
    } finally {
      setIsUploading(false)
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
            onUploadImage={handleUploadImage}
            onDeleteImage={handleDeleteImage}
            isUploading={isUploading}
            imagePreview={imagePreview}
            onImagePreviewChange={setImagePreview}
            onImageUploadSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

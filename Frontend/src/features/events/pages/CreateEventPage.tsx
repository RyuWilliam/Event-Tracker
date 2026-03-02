import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { Button, Card, CardContent, H1 } from "@/shared/ui"
import { EventForm } from "../components/EventForm"
import { useCreateEvent } from "../hooks/useCreateEvent"
import { uploadEventImage } from "../services/eventsApi"
import type { CreateEventPayload } from "../types/event.types"

export function CreateEventPage() {
  const { createEvent, isLoading, error, isSuccess, reset } = useCreateEvent()
  const navigate = useNavigate()
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

  useEffect(() => {
    if (isSuccess) {
      toast.success("Event created successfully!")
      reset()
      setSelectedImageFile(null)
      navigate("/admin/events")
    }
  }, [isSuccess, reset, navigate])

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
          <EventForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            selectedImageFile={selectedImageFile}
            onImageFileChange={setSelectedImageFile}
          />
        </CardContent>
      </Card>
    </div>
  )
}

import { Link } from "react-router"
import { useState, useRef } from "react"
import { PencilIcon, HeartIcon, TrashIcon, ImageIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, H1 } from "@/shared/ui"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { useEvents } from "../hooks/useEvents"
import { deleteEvent, uploadEventImage, deleteEventImage } from "../services/eventsApi"
import { getImageBaseUrl } from "@/lib/apiConfig"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "CANCELLED":
      return "destructive"
    case "FINISHED":
      return "secondary"
    default:
      return "default"
  }
}

function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  const baseUrl = getImageBaseUrl()
  return `${baseUrl}${imageUrl}`
}

export function EventsListPage() {
  const { events, isLoading, error, refetch } = useEvents()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDelete = async (eventId: number) => {
    setDeletingId(eventId)
    try {
      await deleteEvent(eventId)
      refetch()
      toast.success("Event deleted successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete event"
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  const openImageDialog = (eventId: number, currentImageUrl: string | null | undefined) => {
    setSelectedEventId(eventId)
    setSelectedFile(null)
    setPreviewUrl(currentImageUrl || null)
    setImageDialogOpen(true)
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("File must be JPEG, PNG or WebP")
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedEventId) return

    setUploading(true)
    try {
      await uploadEventImage(selectedEventId, selectedFile)
      toast.success("Image uploaded successfully")
      setImageDialogOpen(false)
      refetch()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!selectedEventId) return

    setUploading(true)
    try {
      await deleteEventImage(selectedEventId)
      toast.success("Image deleted successfully")
      setImageDialogOpen(false)
      refetch()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete image"
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const currentEvent = events?.find((e) => e.id === selectedEventId)
  const currentImageUrl = currentEvent?.imageUrl

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <H1>Events</H1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/events/create">Create Event</Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading events...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error: {error}</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events && events.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events yet. Create your first event.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <div className="flex flex-col">
                {event.imageUrl && (
                  <div className="w-full aspect-video shrink-0">
                    <img
                      src={getImageUrl(event.imageUrl)!}
                      alt={event.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="line-clamp-1">{event.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <HeartIcon className="h-4 w-4" />
                          <span className="text-sm">{event.likes || 0}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImageDialog(event.id!, event.imageUrl)}
                          title="Change image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/events/${event.id}/edit`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" disabled={deletingId === event.id}>
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <p className="font-medium">Delete this event?</p>
                              <p className="text-sm text-muted-foreground">
                                This action cannot be undone.
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(event.id!)}
                                  disabled={deletingId === event.id}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {event.description || "No description"}
                    </p>
                    <p className="text-sm">{formatDate(event.date)}</p>
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {event.categories.map((category) => (
                          <Badge key={category.id} variant="accent">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Event Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <UploadIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {currentImageUrl ? "Change" : "Select Image"}
              </Button>
              {currentImageUrl && (
                <Button
                  variant="outline"
                  onClick={handleDeleteImage}
                  disabled={uploading}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

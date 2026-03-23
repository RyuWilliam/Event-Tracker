import { useState, useRef, useMemo, useEffect } from "react"
import { Link } from "react-router"
import { PencilIcon, TrashIcon, ImageIcon, UploadIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
import { Button, Card, CardTitle, CardContent, Badge, H1, Input } from "@/shared/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { useEvents } from "../hooks/useEvents"
import { CreateEventDialog } from "../components/CreateEventDialog"
import { deleteEvent, uploadEventImage, deleteEventImage, getCategories } from "../services/eventsApi"
import { getImageBaseUrl } from "@/lib/apiConfig"
import type { EventCategory } from "../types/event.types"

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [categories, setCategories] = useState<EventCategory[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories()
        setCategories(result)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load categories. The category filter may be unavailable.")
      }
    }

    fetchCategories()
  }, [])

  const filteredEvents = useMemo(() => {
    if (!events) return []

    const normalizedQuery = searchQuery.trim().toLowerCase()

    return events.filter((event) => {
      const matchesSearch =
        normalizedQuery === "" ||
        event.name.toLowerCase().includes(normalizedQuery) ||
        event.description?.toLowerCase().includes(normalizedQuery)

      const matchesStatus = statusFilter === "all" || event.status === statusFilter

      const matchesCategory =
        categoryFilter === "all" ||
        event.categories?.some((cat) => cat.id.toString() === categoryFilter)
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [events, searchQuery, statusFilter, categoryFilter])

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
          <Button onClick={() => setCreateDialogOpen(true)}>
            Create Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-width-select-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FINISHED">Finished</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-width-select-md">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {!isLoading && !error && filteredEvents && filteredEvents.length === 0 && events && events.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events match the selected filters.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredEvents && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="p-0">
              <div className="flex">
                <div className="w-48 h-32 shrink-0 m-2">
                  {event.imageUrl ? (
                    <img
                      src={getImageUrl(event.imageUrl)!}
                      alt={event.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex">
                  <div className="flex-1 p-4 pl-0">
                    <div className="flex items-center mb-2">
                      <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1 mb-1">{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {event.description || "No description"}
                    </p>
                    <p className="text-sm mb-2">{formatDate(event.date)}</p>
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.categories.map((category) => (
                          <Badge key={category.id} variant="accent" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-1 p-2 pl-3 border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageDialog(event.id!, event.imageUrl)}
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
                  </div>
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

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </div>
  )
}

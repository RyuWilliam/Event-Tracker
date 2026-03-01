import { useForm } from "react-hook-form"
import { useEffect, useState, useRef } from "react"
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { CategoriesSelector } from "./CategoriesSelector"
import { UploadIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { CreateEventPayload, Event, EventStatus, EventCategory } from "../types/event.types"
import { uploadEventImage, deleteEventImage } from "../services/eventsApi"
import { getApiBaseUrl } from "@/lib/apiConfig"

interface EventFormProps {
  onSubmit: (data: CreateEventPayload) => Promise<void>
  isLoading: boolean
  initialData?: Event
  submitLabel?: string
}

export function EventForm({ onSubmit, isLoading, initialData, submitLabel }: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventPayload>({
    defaultValues: {
      name: "",
      description: "",
      date: "",
      status: "ACTIVE",
      categories: [],
    },
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name)
      setValue("description", initialData.description || "")
      const dateValue = initialData.date ? initialData.date.slice(0, 16) : ""
      setValue("date", dateValue)
      setValue("status", initialData.status)
      setValue("categories", initialData.categories || [])
      if (initialData.imageUrl) {
        setImagePreview(`${getApiBaseUrl()}${initialData.imageUrl}`)
      }
    }
  }, [initialData, setValue])

  const selectedStatus = watch("status")
  const selectedCategories = watch("categories")

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
    setImagePreview(URL.createObjectURL(file))
    setImageDialogOpen(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile || !initialData?.id) return

    setUploading(true)
    try {
      const result = await uploadEventImage(initialData.id, selectedFile)
      setImagePreview(`${getApiBaseUrl()}${result.imageUrl}`)
      setSelectedFile(null)
      toast.success("Image uploaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!initialData?.id) return

    setUploading(true)
    try {
      await deleteEventImage(initialData.id)
      setImagePreview(null)
      setSelectedFile(null)
      toast.success("Image deleted successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete image"
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const onFormSubmit = async (data: CreateEventPayload) => {
    if (selectedFile && initialData?.id) {
      setUploading(true)
      try {
        await uploadEventImage(initialData.id, selectedFile)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload image"
        toast.error(message)
        return
      } finally {
        setUploading(false)
      }
    }
    const isoDate = new Date(data.date).toISOString()
    await onSubmit({ ...data, date: isoDate })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Event name"
          {...register("name", {
            required: "Name is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
          })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Event description"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="datetime-local"
          {...register("date", {
            required: "Date is required",
          })}
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value: EventStatus) => setValue("status", value)}
          defaultValue={selectedStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FINISHED">Finished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <CategoriesSelector
          selected={selectedCategories || []}
          onChange={(categories: EventCategory[]) => setValue("categories", categories)}
        />
      </div>

      <div className="space-y-2">
        <Label>Event Image (optional)</Label>
        <div className="rounded-lg border p-4">
          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageDialogOpen(true)}
                  disabled={uploading}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={uploading}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => setImageDialogOpen(true)}
            >
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload an image
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || uploading}>
          {isLoading ? (initialData ? "Updating..." : "Creating...") : (submitLabel || "Create Event")}
        </Button>
      </div>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Event Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imagePreview && !selectedFile && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {selectedFile && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!imagePreview && !selectedFile && (
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
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Select Image
              </Button>
              {imagePreview && (
                <Button
                  type="button"
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (selectedFile) {
                  setSelectedFile(null)
                }
                setImageDialogOpen(false)
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedFile) {
                  handleUploadImage()
                }
                setImageDialogOpen(false)
              }}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

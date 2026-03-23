import { useForm } from "react-hook-form"
import { useEffect, useRef, useState } from "react"
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { CategoriesSelector } from "./CategoriesSelector"
import { UploadIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import type { CreateEventPayload, EventStatus, EventCategory } from "../types/event.types"
import type { Event } from "../types/event.types"

interface EventFormProps {
  onSubmit: (data: CreateEventPayload) => Promise<void>
  isLoading: boolean
  initialData?: Event
  submitLabel?: string
  selectedImageFile?: File | null
  onImageFileChange?: (file: File | null) => void
  onUploadImage?: (file: File) => Promise<void>
  onDeleteImage?: () => Promise<void>
  isUploading?: boolean
  imagePreview?: string | null
  onImagePreviewChange?: (url: string | null) => void
  onImageUploadSuccess?: () => void
}

export function EventForm({
  onSubmit,
  isLoading,
  initialData,
  submitLabel,
  selectedImageFile,
  onImageFileChange,
  onUploadImage,
  onDeleteImage,
  isUploading: externalUploading,
  imagePreview: externalImagePreview,
  onImagePreviewChange,
  onImageUploadSuccess,
}: EventFormProps) {
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

  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)
  const [localSelectedFile, setLocalSelectedFile] = useState<File | null>(null)
  const [localUploading, setLocalUploading] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isControlled = onUploadImage !== undefined
  const imagePreview = isControlled ? externalImagePreview : localImagePreview
  const setImagePreview = isControlled 
    ? (onImagePreviewChange ?? (() => {})) 
    : setLocalImagePreview
  const selectedFile = localSelectedFile
  const setSelectedFile = setLocalSelectedFile
  const uploading = isControlled ? externalUploading ?? false : localUploading
  const setUploading = isControlled ? () => {} : setLocalUploading

  const hasExternalUpload = !!onUploadImage

  useEffect(() => {
    if (selectedImageFile) {
      setSelectedFile(selectedImageFile)
      setImagePreview(URL.createObjectURL(selectedImageFile))
    }
  }, [selectedImageFile])

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name)
      setValue("description", initialData.description || "")
      const dateValue = initialData.date ? initialData.date.slice(0, 16) : ""
      setValue("date", dateValue)
      setValue("status", initialData.status)
      setValue("categories", initialData.categories || [])
      if (initialData.imageUrl) {
        const baseUrl = typeof window !== 'undefined' ? (window as any).__IMAGE_BASE_URL__ || '' : ''
        setImagePreview(`${baseUrl}${initialData.imageUrl}`)
      }
    }
  }, [initialData, setValue, setImagePreview])

  const selectedStatus = watch("status")
  const selectedCategories = watch("categories")

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return "File must be JPEG, PNG or WebP"
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    setSelectedFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageDialogOpen(false)
    onImageFileChange?.(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile) return

    if (hasExternalUpload && onUploadImage) {
      setUploading(true)
      try {
        await onUploadImage(selectedFile)
        setSelectedFile(null)
        onImageUploadSuccess?.()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload image"
        toast.error(message)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleDeleteImage = async () => {
    if (hasExternalUpload && onDeleteImage) {
      setUploading(true)
      try {
        await onDeleteImage()
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
  }

  const onFormSubmit = async (data: CreateEventPayload) => {
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
              {imagePreview && hasExternalUpload && (
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
            {hasExternalUpload ? (
              <Button
                type="button"
                onClick={async () => {
                  await handleUploadImage()
                  setImageDialogOpen(false)
                }}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Save"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setImageDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

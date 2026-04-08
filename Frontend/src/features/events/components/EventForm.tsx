import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { CategoriesSelector } from "./CategoriesSelector"
import { toast } from "sonner"
import type { CreateEventPayload, EventStatus, EventCategory } from "../types/event.types"
import type { Event } from "../types/event.types"
import { resolveImageUrl } from "@/lib/image"

interface EventFormProps {
  onSubmit: (data: CreateEventPayload) => Promise<void>
  isLoading: boolean
  initialData?: Event
  submitLabel?: string
}

export function EventForm({
  onSubmit,
  isLoading,
  initialData,
  submitLabel,
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
      imageUrl: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name)
      setValue("description", initialData.description || "")
      const dateValue = initialData.date ? initialData.date.slice(0, 16) : ""
      setValue("date", dateValue)
      setValue("status", initialData.status)
      setValue("categories", initialData.categories || [])
    }
    setValue("imageUrl", initialData?.imageUrl || "")
  }, [initialData, setValue])

  const selectedStatus = watch("status")
  const selectedCategories = watch("categories")

  const watchedImageUrl = watch("imageUrl")
  const imagePreview = resolveImageUrl(watchedImageUrl)

  const onFormSubmit = async (data: CreateEventPayload) => {
    const isoDate = new Date(data.date).toISOString()
    await onSubmit({
      ...data,
      date: isoDate,
      imageUrl: data.imageUrl?.trim() || null,
    })
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
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          {...register("imageUrl")}
        />
        <p className="text-xs text-muted-foreground">
          Paste the public image URL. The backend will store the URL only.
        </p>
        {imagePreview && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={imagePreview}
              alt="Event preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
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

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (initialData ? "Updating..." : "Creating...") : (submitLabel || "Create Event")}
        </Button>
      </div>
    </form>
  )
}

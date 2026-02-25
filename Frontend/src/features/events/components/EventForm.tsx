import { useForm } from "react-hook-form"
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import type { CreateEventPayload, EventStatus } from "../types/event.types"

interface EventFormProps {
  onSubmit: (data: CreateEventPayload) => Promise<void>
  isLoading: boolean
}

export function EventForm({ onSubmit, isLoading }: EventFormProps) {
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

  const selectedStatus = watch("status")

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

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  )
}

import { Input } from "@/shared/ui"
import { Search } from "lucide-react"
import type { EventCategory, EventStatus } from "@/features/events/types/event.types"

interface EventFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: number | null
  onCategoryChange: (value: number | null) => void
  selectedStatus: EventStatus | null
  onStatusChange: (value: EventStatus | null) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  categories: EventCategory[]
  hideStatusFilter?: boolean
}

export function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  categories,
  hideStatusFilter = false,
}: EventFiltersProps) {
  return (
    <div className={`grid gap-3 items-end border-b pb-6 ${hideStatusFilter ? 'md:grid-cols-5' : 'md:grid-cols-6'}`}>
      <div className="flex-1">
        <label className="text-sm font-medium block mb-2">Filter by Category</label>
        <select
          value={selectedCategory ?? ""}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {!hideStatusFilter && (
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">Filter by Status</label>
          <select
            value={selectedStatus ?? ""}
            onChange={(e) => onStatusChange((e.target.value as EventStatus) || null)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="FINISHED">Finished</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      <div className="flex-1">
        <label className="text-sm font-medium block mb-2">Date From</label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium block mb-2">Date To</label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-medium block mb-2">Search by Name</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  )
}
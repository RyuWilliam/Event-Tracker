import type { Event } from "@/features/events"
import { Badge } from "@/shared/ui"

interface ExternalEventCardProps {
  event: Event
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const year = date.getFullYear()
  return { day, month, year }
}

export function ExternalEventCard({ event }: ExternalEventCardProps) {
  const { day, month, year } = formatEventDate(event.date)

  return (
    <div className="group relative flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 px-3 py-2 text-center min-w-[60px]">
        <span className="text-2xl font-bold text-primary">{day}</span>
        <span className="text-xs font-medium text-secondary">{month}</span>
        <span className="text-xs text-muted-foreground">{year}</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
          {event.name}
        </h3>
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.categories.map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

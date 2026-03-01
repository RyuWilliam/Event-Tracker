import { HeartIcon, ImageIcon } from "lucide-react"
import type { Event } from "@/features/events"
import { Badge, Button } from "@/shared/ui"
import { getImageBaseUrl } from "@/lib/apiConfig"

interface ExternalEventCardProps {
  event: Event
  isLiked: boolean
  onLike: (eventId: number) => void
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const year = date.getFullYear()
  return { day, month, year }
}

function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  const baseUrl = getImageBaseUrl()
  return `${baseUrl}${imageUrl}`
}

export function ExternalEventCard({ event, isLiked, onLike }: ExternalEventCardProps) {
  const { day, month, year } = formatEventDate(event.date)
  const imageUrl = getImageUrl(event.imageUrl)

  return (
    <div className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-md">
      {imageUrl ? (
        <div className="w-full h-40 shrink-0">
          <img
            src={imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-40 shrink-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 px-2 py-1 text-center min-w-[40px]">
            <span className="text-lg font-bold text-primary">{day}</span>
            <span className="text-[10px] font-medium text-secondary">{month}</span>
            <span className="text-[10px] text-muted-foreground">{year}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {event.name}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {event.description}
              </p>
            )}
            {event.categories && event.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.categories.map((category) => (
                  <Badge key={category.id} variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => onLike(event.id!)}
          >
            <HeartIcon
              className={`h-5 w-5 ${isLiked ? "fill-accent text-accent" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}

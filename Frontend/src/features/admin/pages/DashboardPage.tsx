import { useState, useEffect } from "react"
import { HeartIcon, TrophyIcon, RefreshCw } from "lucide-react"
import { H1, Card, CardContent, Button } from "@/shared/ui"
import { getFavoriteReport } from "../services/usersApi"

export function DashboardPage() {
  const [report, setReport] = useState<Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = () => {
    setIsLoading(true)
    setError(null)
    getFavoriteReport()
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load report"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadReport()
  }, [])

  // Sort entries by like count descending
  const sorted = report
    ? Object.entries(report).sort(([, a], [, b]) => b - a)
    : []

  const maxLikes = sorted.length > 0 ? sorted[0][1] : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <H1>Dashboard</H1>
        <Button variant="outline" size="sm" onClick={loadReport} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="h-5 w-5 fill-accent text-accent" />
            <h2 className="text-lg font-semibold">Most Liked Events</h2>
          </div>

          {isLoading && (
            <p className="text-muted-foreground text-sm py-4 text-center">Loading report...</p>
          )}

          {error && (
            <p className="text-destructive text-sm py-4 text-center">Error: {error}</p>
          )}

          {!isLoading && !error && sorted.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">No likes recorded yet.</p>
          )}

          {!isLoading && !error && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map(([eventName, likes], index) => (
                <div key={eventName} className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-6 shrink-0 text-center">
                    {index === 0
                      ? <TrophyIcon className="h-4 w-4 text-yellow-500 mx-auto" />
                      : <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                    }
                  </div>

                  {/* Bar + label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate pr-2">{eventName}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <HeartIcon className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="text-sm font-semibold">{likes}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${(likes / maxLikes) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

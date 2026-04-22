import { useState, useEffect } from "react"
import { Users, HeartIcon, ShieldCheck, User as UserIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Badge, Card, CardContent, H1, Input } from "@/shared/ui"
import { getAllUsers } from "../services/usersApi"
import type { User } from "../types/user.types"

function roleBadgeVariant(role: string) {
  return role === "ROLE_ADMIN" ? "default" : "secondary"
}

function roleLabel(role: string) {
  return role === "ROLE_ADMIN" ? "Admin" : "User"
}

function RoleIcon({ role }: { role: string }) {
  return role === "ROLE_ADMIN"
    ? <ShieldCheck className="h-3.5 w-3.5" />
    : <UserIcon className="h-3.5 w-3.5" />
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setIsLoading(false))
  }, [])

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <H1>Users</H1>
        <span className="text-sm text-muted-foreground">{users.length} registered</span>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading users...</CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">Error: {error}</CardContent>
        </Card>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((user) => {
            const isOpen = expanded.has(user.id)
            return (
              <Card key={user.id} className="overflow-hidden">
                {/* User row */}
                <button
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => user.favoriteEvents.length > 0 && toggle(user.id)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Badge variant={roleBadgeVariant(user.role)} className="flex items-center gap-1 shrink-0">
                    <RoleIcon role={user.role} />
                    {roleLabel(user.role)}
                  </Badge>

                  <div className="flex items-center gap-1 text-muted-foreground shrink-0 min-w-[48px] justify-end">
                    <HeartIcon className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm">{user.favoriteEvents.length}</span>
                  </div>

                  {user.favoriteEvents.length > 0 ? (
                    isOpen
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                </button>

                {/* Favorite events expanded */}
                {isOpen && user.favoriteEvents.length > 0 && (
                  <div className="border-t divide-y bg-muted/20">
                    {user.favoriteEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 px-6 py-2.5">
                        <HeartIcon className="h-3.5 w-3.5 mt-0.5 fill-accent text-accent shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.name}</p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                          )}
                        </div>
                        {event.categories && event.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end shrink-0 max-w-[160px]">
                            {event.categories.map((cat) => (
                              <Badge key={cat.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

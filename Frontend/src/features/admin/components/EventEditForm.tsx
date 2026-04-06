import { useState } from "react"
import type { ChangeEvent } from "react"
import { Card, CardContent, CardTitle, Button, Input, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui"
import { ChevronDown, ChevronUp, Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Event, EventTicket, EventCategory, TicketType } from "@/features/events/types/event.types"
import { createTicketType } from "@/features/tickets/services/ticketsApi"

interface EventEditFormProps {
  event: Event
  categories: EventCategory[]
  ticketTypes: TicketType[]
  onSave: (event: Event) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

interface ExpandedTickets {
  [ticketId: number]: boolean
}

export function EventEditForm({
  event: initialEvent,
  categories,
  ticketTypes: initialTicketTypes,
  onSave,
  onCancel,
  isLoading,
}: EventEditFormProps) {
  const [event, setEvent] = useState<Event>(initialEvent)
  const [expandedTickets, setExpandedTickets] = useState<ExpandedTickets>({})
  const [isSaving, setIsSaving] = useState(false)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(initialTicketTypes)
  const [showCreateTypeStates, setShowCreateTypeStates] = useState<{ [key: string]: boolean }>({})
  const [newTypeName, setNewTypeName] = useState("")
  const [isCreatingType, setIsCreatingType] = useState(false)

  const handleEventChange = (
    field: keyof Event,
    value: string | boolean | EventCategory[] | TicketType | Event["status"]
  ) => {
    setEvent((prev: Event) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTicketChange = (
    ticketId: number | null | undefined,
    field: keyof EventTicket,
    value: number | TicketType
  ) => {
    setEvent((prev: Event) => ({
      ...prev,
      tickets: prev.tickets?.map((ticket: EventTicket) => {
        if (ticket.id === ticketId) {
          return { ...ticket, [field]: value }
        }
        return ticket
      }) || [],
    }))
  }

  const handleAddTicket = () => {
    const newTicket: EventTicket = {
      id: undefined as any,
      ticketType: ticketTypes[0] || { id: 1, name: "Standard" },
      price: 0,
      totalQuantity: 100,
      soldQuantity: 0,
    }
    setEvent((prev: Event) => ({
      ...prev,
      tickets: [...(prev.tickets || []), newTicket],
    }))
  }

  const handleDeleteTicket = (ticketId: number | undefined) => {
    setEvent((prev: Event) => ({
      ...prev,
      tickets: prev.tickets?.filter((t: EventTicket) => t.id !== ticketId) || [],
    }))
  }

  const toggleTicketExpand = (ticketId: number | undefined) => {
    if (ticketId === undefined) return
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(event)
      toast.success("Event saved successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateTicketType = async (dialogKey: string) => {
    if (!newTypeName.trim()) {
      toast.error("Ticket type name cannot be empty")
      return
    }

    try {
      setIsCreatingType(true)
      const newType = await createTicketType(newTypeName.trim())
      setTicketTypes((prev) => [...prev, newType])
      setNewTypeName("")
      setShowCreateTypeStates((prev) => ({ ...prev, [dialogKey]: false }))
      toast.success("Ticket type created successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket type")
    } finally {
      setIsCreatingType(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Event Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={event.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEventChange("name", e.target.value)
              }
              placeholder="Event name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={event.description || ""}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleEventChange("description", e.target.value)
              }
              placeholder="Event description"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={event.date ? event.date.split('T')[0] : ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEventChange("date", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={event.status || "ACTIVE"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleEventChange("status", e.target.value)
                }
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={event.imageUrl || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEventChange("imageUrl", e.target.value)
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Categories</label>
            <div className="space-y-2">
              {categories.map((cat: EventCategory) => (
                <label key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={event.categories?.some((c) => c.id === cat.id) || false}
                    onCheckedChange={(checked: boolean) => {
                      const newCategories = checked
                        ? [...(event.categories || []), cat]
                        : event.categories?.filter((c: EventCategory) => c.id !== cat.id) || []
                      handleEventChange("categories", newCategories)
                    }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tickets</h3>
          <Button onClick={handleAddTicket} size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ticket
          </Button>
        </div>

        {event.tickets && event.tickets.length > 0 ? (
          <div className="space-y-2">
            {event.tickets.map((ticket: EventTicket, index: number) => {
              const canEdit = !ticket.id || ticket.soldQuantity === 0
              const isExpanded = expandedTickets[ticket.id || index]
              const isNewTicket = !ticket.id

              return (
                <Card key={ticket.id || index} className={isNewTicket ? "border-dashed" : ""}>
                  <CardContent className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleTicketExpand(ticket.id)}
                    >
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {ticket.ticketType?.name || "New Ticket"}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          ${ticket.price.toFixed(2)} • {ticket.totalQuantity - ticket.soldQuantity} /
                          {ticket.totalQuantity} available
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            handleDeleteTicket(ticket.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {ticket.id && (
                          isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {ticket.id && isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {!canEdit && (
                          <div className="flex gap-2 p-2 bg-destructive/10 text-destructive/80 text-xs rounded">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>This ticket has sales and cannot be edited</span>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-medium">Ticket Type</label>
                          <div className="flex gap-2 mt-1">
                            <select
                              value={ticket.ticketType?.id || ""}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                const selectedType = ticketTypes.find(
                                  (t: TicketType) => t.id === parseInt(e.target.value)
                                )
                                if (selectedType) {
                                  handleTicketChange(ticket.id, "ticketType", selectedType)
                                }
                              }}
                              disabled={!canEdit}
                              className="flex-1 px-2 py-1 border border-input rounded text-sm"
                            >
                              <option value="">Select type...</option>
                              {ticketTypes.map((t: TicketType) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <Dialog
                              open={showCreateTypeStates[`existing-${ticket.id}`] || false}
                              onOpenChange={(open) =>
                                setShowCreateTypeStates((prev) => ({
                                  ...prev,
                                  [`existing-${ticket.id}`]: open,
                                }))
                              }
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="px-2">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create New Ticket Type</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Ticket type name (e.g., VIP, General, Premium)"
                                    value={newTypeName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      setNewTypeName(e.target.value)
                                    }
                                  />
                                  <Button
                                    onClick={() =>
                                      handleCreateTicketType(`existing-${ticket.id}`)
                                    }
                                    disabled={isCreatingType}
                                    className="w-full"
                                  >
                                    {isCreatingType ? "Creating..." : "Create Type"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium">Price</label>
                            <Input
                              type="number"
                              value={ticket.price}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTicketChange(ticket.id, "price", parseFloat(e.target.value))
                              }
                              disabled={!canEdit}
                              className="text-sm mt-1"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Total Quantity</label>
                            <Input
                              type="number"
                              value={ticket.totalQuantity}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTicketChange(
                                  ticket.id,
                                  "totalQuantity",
                                  parseInt(e.target.value)
                                )
                              }
                              disabled={!canEdit}
                              className="text-sm mt-1"
                              min="1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium">Sold Quantity (Read-only)</label>
                          <Input
                            type="number"
                            value={ticket.soldQuantity}
                            disabled
                            className="text-sm mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* New Ticket Form (always expanded) */}
                    {isNewTicket && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <label className="text-xs font-medium">Ticket Type</label>
                          <div className="flex gap-2 mt-1">
                            <select
                              value={ticket.ticketType?.id || ""}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                const selectedType = ticketTypes.find(
                                  (t: TicketType) => t.id === parseInt(e.target.value)
                                )
                                if (selectedType) {
                                  handleTicketChange(undefined, "ticketType", selectedType)
                                }
                              }}
                              className="flex-1 px-2 py-1 border border-input rounded text-sm"
                            >
                              <option value="">Select type...</option>
                              {ticketTypes.map((t: TicketType) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <Dialog
                              open={showCreateTypeStates[`new-${index}`] || false}
                              onOpenChange={(open) =>
                                setShowCreateTypeStates((prev) => ({
                                  ...prev,
                                  [`new-${index}`]: open,
                                }))
                              }
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="px-2">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create New Ticket Type</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Ticket type name (e.g., VIP, General, Premium)"
                                    value={newTypeName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      setNewTypeName(e.target.value)
                                    }
                                  />
                                  <Button
                                    onClick={() => handleCreateTicketType(`new-${index}`)}
                                    disabled={isCreatingType}
                                    className="w-full"
                                  >
                                    {isCreatingType ? "Creating..." : "Create Type"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium">Price</label>
                            <Input
                              type="number"
                              value={ticket.price}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTicketChange(undefined, "price", parseFloat(e.target.value))
                              }
                              className="text-sm mt-1"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Total Quantity</label>
                            <Input
                              type="number"
                              value={ticket.totalQuantity}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleTicketChange(
                                  undefined,
                                  "totalQuantity",
                                  parseInt(e.target.value)
                                )
                              }
                              className="text-sm mt-1"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No tickets yet</p>
            <p className="text-xs mt-1">Click "Add Ticket" to create one</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

export default EventEditForm

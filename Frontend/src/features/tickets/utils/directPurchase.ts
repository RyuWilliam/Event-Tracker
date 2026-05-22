import type { EventTicket } from "@/features/events"

export function getAvailableQuantity(ticket: EventTicket): number {
  return Math.max(0, ticket.totalQuantity - ticket.soldQuantity)
}

export function formatEventDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getPurchaseErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined
  const apiMessage = error instanceof Error ? error.message : ""

  if (status === 401 || status === 403) {
    return "Your session is no longer valid. Please sign in again and retry."
  }

  if (status === 409) {
    return apiMessage || "Ticket availability changed. Please review quantities and try again."
  }

  if (status === 400) {
    return apiMessage || "Invalid purchase request. Please review ticket quantities and retry."
  }

  if (status && status >= 500) {
    return apiMessage || "We could not complete your purchase due to a server issue. Please try again in a moment."
  }

  return apiMessage || "Purchase failed. Please try again."
}
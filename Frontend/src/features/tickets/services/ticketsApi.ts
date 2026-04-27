import type { TicketPurchase, PurchaseTicketPayload, TicketResume } from "../types/ticket.types"
import type { EventTicket } from "@/features/events/types/event.types"
import type { TicketType } from "@/features/events/types/event.types"
import { getApiBaseUrl } from "@/lib/apiConfig"
import { getAuthHeaders } from "@/features/auth"

const BASE_URL = getApiBaseUrl()

interface ApiError extends Error {
  status?: number
}

async function buildApiError(response: Response, fallbackMessage: string): Promise<ApiError> {
  let message = fallbackMessage

  try {
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      const payload = (await response.json()) as { message?: string; error?: string }
      message = payload.message ?? payload.error ?? fallbackMessage
    } else {
      const payloadText = await response.text()
      if (payloadText.trim().length > 0) {
        message = payloadText
      }
    }
  } catch {
    message = fallbackMessage
  }

  const error = new Error(message) as ApiError
  error.status = response.status
  return error
}

async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  throw await buildApiError(response, fallbackMessage)
}

export async function getTicket(ticketId: number): Promise<EventTicket> {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    await throwApiError(response, "Failed to fetch ticket")
  }
  return response.json()
}

export async function purchaseTicket(payload: PurchaseTicketPayload): Promise<TicketResume> {
  const response = await fetch(`${BASE_URL}/tickets/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await throwApiError(response, "Failed to purchase ticket")
  }

  return response.json()
}

export async function getUserPurchases(): Promise<TicketPurchase[]> {
  const response = await fetch(`${BASE_URL}/ticket-purchases`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    await throwApiError(response, "Failed to fetch user purchases")
  }
  return response.json()
}

export async function getUserTicketResumes(): Promise<TicketResume[]> {
  const response = await fetch(`${BASE_URL}/users/purchases`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    await throwApiError(response, "Failed to fetch user ticket resumes")
  }
  return response.json()
}

export async function getPurchaseQr(purchaseId: number): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/tickets/purchase/${purchaseId}/qr`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch QR")
  }

  return response.blob()
}

export async function deletePurchase(purchaseId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/ticket-purchases/${purchaseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    await throwApiError(response, "Failed to delete purchase")
  }
}

export async function getTicketTypes(): Promise<TicketType[]> {
  const response = await fetch(`${BASE_URL}/tickets/types`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    await throwApiError(response, "Failed to fetch ticket types")
  }

  return response.json()
}

export async function createTicketType(name: string): Promise<TicketType> {
  const response = await fetch(`${BASE_URL}/tickets/type/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    await throwApiError(response, "Failed to create ticket type")
  }

  return response.json()
}

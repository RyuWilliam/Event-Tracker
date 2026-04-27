import type { TicketPurchase, PurchaseTicketPayload, TicketResume } from "../types/ticket.types"
import type { EventTicket } from "@/features/events/types/event.types"
import type { TicketType } from "@/features/events/types/event.types"
import { getApiBaseUrl } from "@/lib/apiConfig"
import { getAuthHeaders } from "@/features/auth"

const BASE_URL = getApiBaseUrl()

export async function getTicket(ticketId: number): Promise<EventTicket> {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ticket: ${response.status}`)
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
    throw new Error(`Failed to purchase ticket: ${response.status}`)
  }

  return response.json()
}

export async function getUserPurchases(): Promise<TicketPurchase[]> {
  const response = await fetch(`${BASE_URL}/ticket-purchases`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch user purchases: ${response.status}`)
  }
  return response.json()
}

export async function getUserTicketResumes(): Promise<TicketResume[]> {
  const response = await fetch(`${BASE_URL}/users/purchases`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch user ticket resumes: ${response.status}`)
  }
  return response.json()
}

export async function getPurchaseQr(purchaseId: number): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/tickets/purchase/${purchaseId}/qr`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch QR: ${response.status}`)
  }

  return response.blob()
}

export async function deletePurchase(purchaseId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/ticket-purchases/${purchaseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete purchase: ${response.status}`)
  }
}

export async function getTicketTypes(): Promise<TicketType[]> {
  const response = await fetch(`${BASE_URL}/tickets/types`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ticket types: ${response.status}`)
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
    throw new Error(`Failed to create ticket type: ${response.status}`)
  }

  return response.json()
}

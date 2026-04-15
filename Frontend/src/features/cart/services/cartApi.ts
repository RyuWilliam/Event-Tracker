import type { CartItem, CartItemPayload, CheckoutResult } from "../types/cart.types"
import * as ticketsApi from "@/features/tickets/services/ticketsApi"

export function mapItemToPayload(item: CartItem): CartItemPayload {
  return {
    quantity: item.quantity,
    eventTicket: { id: item.eventTicketId },
  }
}

export async function checkoutCart(items: CartItem[]): Promise<CheckoutResult> {
  try {
    const payloadItems = items.map(mapItemToPayload)
    const ticketResume = await ticketsApi.purchaseTicket({ items: payloadItems })

    return {
      success: true,
      ticketResume,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
    }
  }
}
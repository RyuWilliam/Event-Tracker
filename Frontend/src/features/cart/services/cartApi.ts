import type { CartItem, CartItemPayload, CheckoutResult } from "../types/cart.types"
import * as ticketsApi from "@/features/tickets/services/ticketsApi"

export interface ICheckoutService {
  checkout(items: CartItem[]): Promise<CheckoutResult>
}

class MultipleRequestsCheckout implements ICheckoutService {
  async checkout(items: CartItem[]): Promise<CheckoutResult> {
    const results: CheckoutResult["results"] = []

    for (const item of items) {
      try {
        const payload: CartItemPayload = {
          quantity: item.quantity,
          eventTicket: { id: item.eventTicketId },
        }

        const ticketResume = await ticketsApi.purchaseTicket(payload)

        results.push({
          item,
          success: true,
          ticketResume: {
            id: ticketResume.id ?? 0,
            eventName: ticketResume.eventName,
            type: { name: ticketResume.type.name },
            quantity: ticketResume.quantity,
            total: ticketResume.total,
          },
        })
      } catch (error) {
        results.push({
          item,
          success: false,
          error: error instanceof Error ? error.message : "Purchase failed",
        })
      }
    }

    const allSuccess = results.every((r) => r.success)

    return {
      success: allSuccess,
      results,
    }
  }
}

export const checkoutService: ICheckoutService = new MultipleRequestsCheckout()

export async function checkoutCart(items: CartItem[]): Promise<CheckoutResult> {
  return checkoutService.checkout(items)
}

export function mapItemToPayload(item: CartItem): CartItemPayload {
  return {
    quantity: item.quantity,
    eventTicket: { id: item.eventTicketId },
  }
}
import type { CartItem } from "../types/cart.types"

const STORAGE_KEY = "event-tracker-cart"

export function loadCartFromSession(): CartItem[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]
  } catch {
    return []
  }
}

export function saveCartToSession(items: CartItem[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Failed to save cart to session:", error)
  }
}

export function clearCartFromSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear cart from session:", error)
  }
}
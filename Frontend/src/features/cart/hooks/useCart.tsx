import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { CartItem } from "../types/cart.types"
import {
  loadCartFromSession,
  saveCartToSession,
  clearCartFromSession,
} from "../services/cartSession"

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (eventTicketId: number) => void
  updateQuantity: (eventTicketId: number, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromSession())
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    saveCartToSession(items)
  }, [items])

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.eventTicketId === newItem.eventTicketId,
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        const existing = updated[existingIndex]
        const newQuantity = Math.min(
          existing.quantity + newItem.quantity,
          newItem.maxAvailable,
        )
        updated[existingIndex] = { ...existing, quantity: newQuantity }
        return updated
      }

      return [...prev, newItem]
    })
  }, [])

  const removeItem = useCallback((eventTicketId: number) => {
    setItems((prev) => prev.filter((item) => item.eventTicketId !== eventTicketId))
  }, [])

  const updateQuantity = useCallback((eventTicketId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.eventTicketId === eventTicketId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxAvailable)) }
          : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    clearCartFromSession()
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
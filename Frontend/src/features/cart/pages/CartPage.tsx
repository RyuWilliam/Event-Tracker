import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/ui"
import { H2, Body } from "@/shared/ui"
import { CartItemCard } from "../components/CartItemCard"
import { CartSummary } from "../components/CartSummary"
import { useCart } from "../hooks/useCart"
import { checkoutCart } from "../services/cartApi"

export function CartPage() {
  const { items, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return

    setLoading(true)
    try {
      const result = await checkoutCart(items)

      if (result.success) {
        const totalPurchased = result.results.reduce(
          (sum, r) => (r.success ? sum + r.item.quantity : sum),
          0,
        )
        toast.success(
          `Successfully purchased ${totalPurchased} ticket${totalPurchased > 1 ? "s" : ""}!`,
        )
        clearCart()
        navigate("/my-purchases")
      } else {
        const failedCount = result.results.filter((r) => !r.success).length
        const successCount = result.results.filter((r) => r.success).length

        if (successCount > 0) {
          toast.warning(
            `${successCount} ticket${successCount > 1 ? "s" : ""} purchased, ${failedCount} failed`,
          )
        } else {
          toast.error("All purchases failed. Please try again.")
        }
      }
    } catch (error) {
      toast.error("Failed to process purchase")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <H2 className="mb-2">Your cart is empty</H2>
          <Body className="text-muted-foreground mb-6">
            Browse events and add tickets to your cart
          </Body>
          <Button onClick={() => navigate("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Events
          </Button>
        </div>
      </div>
    )
  }

  const itemsByEvent = items.reduce(
    (acc, item) => {
      if (!acc[item.eventName]) {
        acc[item.eventName] = []
      }
      acc[item.eventName].push(item)
      return acc
    },
    {} as Record<string, typeof items>,
  )

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <H2>Shopping Cart</H2>
        </div>
        <Button variant="ghost" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(itemsByEvent).map(([eventName, eventItems]) => (
          <div key={eventName} className="space-y-3">
            <h3 className="font-semibold text-lg">{eventName}</h3>
            <div className="space-y-3">
              {eventItems.map((item) => (
                <CartItemCard key={item.eventTicketId} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <CartSummary
          showCheckoutButton
          onCheckout={handleCheckout}
          checkoutLoading={loading}
        />
      </div>
    </div>
  )
}
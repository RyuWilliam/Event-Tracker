import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router"
import { CartItemCard } from "./CartItemCard"
import { useCart } from "../hooks/useCart"

export function CartDrawer() {
  const { items, itemCount, total, isCartOpen, setIsCartOpen } = useCart()
  const navigate = useNavigate()

  const handleGoToCart = () => {
    setIsCartOpen(false)
    navigate("/cart")
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-[380px] sm:w-[450px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <span className="text-muted-foreground text-sm font-normal">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Your cart is empty</p>
            <p className="text-xs mt-1">Add tickets to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item) => (
                <CartItemCard key={item.eventTicketId} item={item} />
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full gap-2" onClick={handleGoToCart}>
                Go to Cart
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
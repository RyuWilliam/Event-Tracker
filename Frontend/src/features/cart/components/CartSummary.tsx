import { Button } from "@/shared/ui"
import { DollarSign } from "lucide-react"
import { useCart } from "../hooks/useCart"

interface CartSummaryProps {
  showCheckoutButton?: boolean
  onCheckout?: () => void
  checkoutLoading?: boolean
}

export function CartSummary({
  showCheckoutButton = false,
  onCheckout,
  checkoutLoading = false,
}: CartSummaryProps) {
  const { total, itemCount } = useCart()

  return (
    <div className="border-t pt-4 space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="font-medium">${total.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <div className="flex items-center text-lg font-semibold">
          <DollarSign className="h-5 w-5 mr-1" />
          Total
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-500">
          ${total.toFixed(2)}
        </div>
      </div>

      {showCheckoutButton && (
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={checkoutLoading || itemCount === 0}
        >
          {checkoutLoading ? "Processing..." : "Confirm Purchase"}
        </Button>
      )}
    </div>
  )
}
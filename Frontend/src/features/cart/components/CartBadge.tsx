import { Button } from "@/shared/ui"
import { Badge } from "@/shared/ui"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../hooks/useCart"

export function CartBadge() {
  const { itemCount, setIsCartOpen } = useCart()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Button>
  )
}
import { Card, CardContent } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "../types/cart.types"
import { useCart } from "../hooks/useCart"

interface CartItemCardProps {
  item: CartItem
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.eventName}</p>
              <p className="text-xs text-muted-foreground">{item.ticketTypeName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.eventTicketId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                disabled={item.quantity <= 1}
                onClick={() => updateQuantity(item.eventTicketId, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full"
                disabled={item.quantity >= item.maxAvailable}
                onClick={() => updateQuantity(item.eventTicketId, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-sm font-medium">
              ${(item.quantity * item.unitPrice).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
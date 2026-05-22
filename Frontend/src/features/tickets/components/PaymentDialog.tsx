import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import type { PaymentDetails } from "../types/ticket.types"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  onConfirm: (paymentInfo: PaymentDetails) => Promise<void>
  isPurchasing: boolean
}

export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirm,
  isPurchasing,
}: PaymentDialogProps) {
  const [userEmail, setUserEmail] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardType, setCardType] = useState("VISA")
  const [csv, setCsv] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      userEmail,
      card: {
        cardType,
        cardNumber,
        cardHolderName: cardType === "NU" ? "No Name" : cardHolderName,
        ...(cardType === "NU" && { csv }),
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete the purchase of ${totalAmount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                required
                placeholder="pedro@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select value={cardType} onValueChange={setCardType}>
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">VISA</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                <SelectItem value="NU">NU</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cardType !== "NU" ? (
            <div className="space-y-2">
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input
                id="cardHolder"
                required
                placeholder="Pedro Picapiedra"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="csv">CSV (Security Code)</Label>
              <Input
                id="csv"
                required
                placeholder="123"
                maxLength={4}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                required
                placeholder="1231231231123222"
                minLength={16}
                maxLength={19}
                pattern="[0-9]*"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPurchasing}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
  const [cardType, setCardType] = useState("")
  const [csv, setCsv] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cardMeta: Record<string, { numberLengths: number[]; csvLength: number }> = {
    VISA: { numberLengths: [16], csvLength: 3 },
    MASTERCARD: { numberLengths: [16], csvLength: 3 },
    AMEX: { numberLengths: [15], csvLength: 4 },
    NU: { numberLengths: [16], csvLength: 3 },
  }

  const cardConfig = cardType ? cardMeta[cardType] : null
  const isCardTypeSelected = Boolean(cardType)

  const clearError = (field: string) => {
    if (!errors[field]) {
      return
    }
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    const normalizedCard = cardNumber.replace(/\D/g, "")
    const normalizedCsv = csv.replace(/\D/g, "")

    if (!cardType) {
      nextErrors.cardType = "Select a card type."
    }

    if (!userEmail.trim()) {
      nextErrors.userEmail = "Email is required."
    } else if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
      nextErrors.userEmail = "Enter a valid email."
    }

    if (!cardHolderName.trim()) {
      nextErrors.cardHolderName = "Cardholder name is required."
    }

    if (!normalizedCard) {
      nextErrors.cardNumber = "Card number is required."
    } else if (cardConfig && !cardConfig.numberLengths.includes(normalizedCard.length)) {
      nextErrors.cardNumber = `Card number must be ${cardConfig.numberLengths.join(" or ")} digits.`
    }

    if (!normalizedCsv) {
      nextErrors.csv = "Security code is required."
    } else if (cardConfig && normalizedCsv.length !== cardConfig.csvLength) {
      nextErrors.csv = `Security code must be ${cardConfig.csvLength} digits.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      return
    }
    onConfirm({
      userEmail,
      card: {
        cardType,
        cardNumber,
        cardHolderName,
        csv,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Confirm your payment details for ${totalAmount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select
              value={cardType}
              onValueChange={(value) => {
                setCardType(value)
                clearError("cardType")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">VISA</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                <SelectItem value="AMEX">American Express</SelectItem>
                <SelectItem value="NU">NU</SelectItem>
              </SelectContent>
            </Select>
            {errors.cardType && (
              <p className="text-xs text-destructive">{errors.cardType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                required
                disabled={!isCardTypeSelected}
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value)
                  clearError("userEmail")
                }}
              />
            </div>
            {errors.userEmail && (
              <p className="text-xs text-destructive">{errors.userEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolder">Cardholder Name</Label>
            <Input
              id="cardHolder"
              required
              disabled={!isCardTypeSelected}
              value={cardHolderName}
              onChange={(e) => {
                setCardHolderName(e.target.value)
                clearError("cardHolderName")
              }}
            />
            {errors.cardHolderName && (
              <p className="text-xs text-destructive">{errors.cardHolderName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                required
                inputMode="numeric"
                minLength={cardConfig ? Math.min(...cardConfig.numberLengths) : 13}
                maxLength={cardConfig ? Math.max(...cardConfig.numberLengths) : 19}
                pattern="[0-9\s]*"
                disabled={!isCardTypeSelected}
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(e.target.value)
                  clearError("cardNumber")
                }}
              />
            </div>
            {errors.cardNumber && (
              <p className="text-xs text-destructive">{errors.cardNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">Security Code</Label>
            <Input
              id="csv"
              required
              inputMode="numeric"
              maxLength={cardConfig ? cardConfig.csvLength : 4}
              pattern="[0-9]*"
              disabled={!isCardTypeSelected}
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value)
                clearError("csv")
              }}
            />
            {errors.csv && (
              <p className="text-xs text-destructive">{errors.csv}</p>
            )}
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
              {isPurchasing ? "Processing..." : `Confirm Purchase $${totalAmount.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import type { PaymentDetails } from "../types/ticket.types"

interface ConfirmPurchaseFormProps {
  onConfirm: (paymentInfo: PaymentDetails) => Promise<void>
  formId: string
  userEmail: string
  isPurchasing: boolean
}

export function ConfirmPurchaseForm({
  onConfirm,
  formId,
  userEmail,
  isPurchasing,
}: ConfirmPurchaseFormProps) {
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardType, setCardType] = useState("")
  const [csv, setCsv] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cardMeta: Record<string, { numberLengths: number[]; csvLength?: number }> = {
    VISA: { numberLengths: [16] },
    MASTERCARD: { numberLengths: [16] },
    AMEX: { numberLengths: [15] },
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

    if (!cardType) {
      nextErrors.cardType = "Select a card type."
    }

    if (!userEmail.trim()) {
      nextErrors.userEmail = "We could not read your email. Please sign in again."
    }

    if (cardType === "NU") {
      const normalizedCsv = csv.replace(/\D/g, "")
      if (!normalizedCsv) {
        nextErrors.csv = "CVV is required."
      } else if (cardConfig?.csvLength && normalizedCsv.length !== cardConfig.csvLength) {
        nextErrors.csv = `CVV must be ${cardConfig.csvLength} digits.`
      }
    } else if (!cardHolderName.trim()) {
      nextErrors.cardHolderName = "Cardholder name is required."
    }

    if (!normalizedCard) {
      nextErrors.cardNumber = "Card number is required."
    } else if (cardConfig && !cardConfig.numberLengths.includes(normalizedCard.length)) {
      nextErrors.cardNumber = `Card number must be ${cardConfig.numberLengths.join(" or ")} digits.`
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
        cardHolderName: cardType === "NU" ? "No Name" : cardHolderName,
        ...(cardType === "NU" && { csv }),
      },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardType">Card Type</Label>
        <Select
          value={cardType}
          onValueChange={(value) => {
            setCardType(value)
            clearError("cardType")
          }}
          disabled={isPurchasing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VISA">VISA</SelectItem>
            <SelectItem value="MASTERCARD">Mastercard</SelectItem>
            <SelectItem value="NU">NU</SelectItem>
          </SelectContent>
        </Select>
        {errors.cardType && <p className="text-xs text-destructive">{errors.cardType}</p>}
      </div>

      {errors.userEmail && <p className="text-xs text-destructive">{errors.userEmail}</p>}

      {cardType === "NU" ? (
        <div className="space-y-2">
          <Label htmlFor="csv">CVV</Label>
          <Input
            id="csv"
            required
            inputMode="numeric"
            maxLength={cardConfig?.csvLength ?? 3}
            pattern="[0-9]*"
            disabled={!isCardTypeSelected || isPurchasing}
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value)
              clearError("csv")
            }}
          />
          {errors.csv && <p className="text-xs text-destructive">{errors.csv}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="cardHolder">Cardholder Name</Label>
          <Input
            id="cardHolder"
            required
            disabled={!isCardTypeSelected || isPurchasing}
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
      )}

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          required
          inputMode="numeric"
          minLength={cardConfig ? Math.min(...cardConfig.numberLengths) : 13}
          maxLength={cardConfig ? Math.max(...cardConfig.numberLengths) : 19}
          pattern="[0-9\s]*"
          disabled={!isCardTypeSelected || isPurchasing}
          value={cardNumber}
          onChange={(e) => {
            setCardNumber(e.target.value)
            clearError("cardNumber")
          }}
        />
        {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
      </div>
    </form>
  )
}

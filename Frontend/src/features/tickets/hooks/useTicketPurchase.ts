import { useState } from "react"
import type { TicketPurchase, PurchaseTicketPayload, TicketResume } from "../types/ticket.types"
import * as ticketsApi from "../services/ticketsApi"

interface UseTicketPurchaseState {
  loading: boolean
  error: string | null
}

export function useTicketPurchase() {
  const [state, setState] = useState<UseTicketPurchaseState>({
    loading: false,
    error: null,
  })

  const purchase = async (payload: PurchaseTicketPayload): Promise<TicketResume | null> => {
    setState({ loading: true, error: null })
    try {
      const result = await ticketsApi.purchaseTicket(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to purchase ticket"
      setState({ loading: false, error: errorMessage })
      throw err
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const getPurchases = async (): Promise<TicketPurchase[]> => {
    setState({ loading: true, error: null })
    try {
      const result = await ticketsApi.getUserPurchases()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch purchases"
      setState({ loading: false, error: errorMessage })
      throw err
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const getTicketResumes = async (): Promise<TicketResume[]> => {
    setState({ loading: true, error: null })
    try {
      const result = await ticketsApi.getUserTicketResumes()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch ticket resumes"
      setState({ loading: false, error: errorMessage })
      throw err
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const getQrImage = async (purchaseId: number): Promise<string> => {
    try {
      const blob = await ticketsApi.getPurchaseQr(purchaseId)
      return URL.createObjectURL(blob)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch QR"
      throw new Error(errorMessage)
    }
  }

  const deletePurchase = async (purchaseId: number): Promise<void> => {
    setState({ loading: true, error: null })
    try {
      await ticketsApi.deletePurchase(purchaseId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete purchase"
      setState({ loading: false, error: errorMessage })
      throw err
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  return {
    purchase,
    getPurchases,
    getTicketResumes,
    getQrImage,
    deletePurchase,
    ...state,
  }
}

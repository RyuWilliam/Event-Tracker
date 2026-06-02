import { useCallback, useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useAuth } from "@/features/auth"

export interface PaymentStatusMessage {
  status: string
  userMessage: string
  correlationId: string
}

interface UsePaymentWebSocketOptions {
  userId: string | null
  onMessage: (message: PaymentStatusMessage) => void
}

export function usePaymentWebSocket({ userId, onMessage }: UsePaymentWebSocketOptions) {
  const { token } = useAuth()
  const clientRef = useRef<Client | null>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  const disconnect = useCallback(() => {
    subscriptionRef.current?.unsubscribe()
    subscriptionRef.current = null

    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!token || !userId) {
      return
    }

    if (clientRef.current?.active) {
      return
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:7022/tracker/api/ws/payments"),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 0,
      debug: () => {},
    })

    client.onConnect = () => {
      subscriptionRef.current = client.subscribe("/user/queue/payment-status", (frame) => {
        try {
          const payload = JSON.parse(frame.body) as PaymentStatusMessage
          onMessage(payload)
        } catch {
          onMessage({
            status: "UNKNOWN",
            userMessage: frame.body,
            correlationId: "",
          })
        }
      })
    }

    client.onStompError = () => {
      disconnect()
    }

    client.onWebSocketClose = () => {
      subscriptionRef.current = null
    }

    client.activate()
    clientRef.current = client
  }, [disconnect, onMessage, token, userId])

  useEffect(() => () => disconnect(), [disconnect])

  return { connect, disconnect }
}

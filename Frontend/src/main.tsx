import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import { router } from "./app/router"
import { AuthProvider, AuthPromptProvider } from "@/features/auth"
import { CartProvider } from "@/features/cart"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthPromptProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthPromptProvider>
    </AuthProvider>
  </StrictMode>
)

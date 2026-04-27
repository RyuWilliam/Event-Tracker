import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import { router } from "./app/router"
import { AuthProvider, AuthPromptProvider } from "@/features/auth"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthPromptProvider>
        <RouterProvider router={router} />
      </AuthPromptProvider>
    </AuthProvider>
  </StrictMode>
)

import { Outlet } from "react-router"
import { AuthPopup } from "@/features/auth"
import { Toaster } from "@/shared/ui"
import { CartDrawer } from "@/features/cart"

export function AppLayout() {
  return (
    <>
      <Outlet />
      <AuthPopup />
      <Toaster />
      <CartDrawer />
    </>
  )
}

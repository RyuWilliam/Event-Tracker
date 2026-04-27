import { Outlet } from "react-router"
import { AuthPopup } from "@/features/auth"
import { Toaster } from "@/shared/ui"

export function AppLayout() {
  return (
    <>
      <Outlet />
      <AuthPopup />
      <Toaster />
    </>
  )
}

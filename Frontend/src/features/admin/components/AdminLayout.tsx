import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@/shared/ui"
import { AppSidebar } from "./AppSidebar"

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@/shared/ui"
import { AppSidebar } from "./AdminSidebar"

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4 pt-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

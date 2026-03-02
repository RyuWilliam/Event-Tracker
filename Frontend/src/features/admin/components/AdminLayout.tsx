import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui"
import { AppSidebar } from "./AppSidebar"

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
